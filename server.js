const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const { exec } = require('child_process'); 
const https = require('https');
const fs = require('fs');


const sslOptions = {
  key: fs.readFileSync('ssl/key.pem'),
  cert: fs.readFileSync('ssl/cert.pem'),
};
// Models
const User = require('./models/User');  // Assuming you have a User model defined


// Express app setup
const app = express();
const port = 5000;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: '0000',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,      
    secure: true,        
    maxAge: 1000 * 60 * 60 * 24  
  }
}));


// MongoDB connection
mongoose.connect('mongodb://localhost:27017/issueboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 50000,
}).then(async () => {
  console.log("Connected to MongoDB");

 
}).catch((error) => {
  console.error("MongoDB connection error:", error);
});


// Serve the index.html file for the root route
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Ensure the correct path is provided to the HTML file
});

// Serve static files like CSS, JS, images
app.use(express.static(__dirname));





// Routes (server.js)
app.post('/signup', async (req, res) => {
  try {
    const { username, phonenumber, email, password, role, adminAccessCode } = req.body;

    if (!username || !phonenumber || !email || !password || !role) {
      return res.status(400).send("All fields are required");
    }

    // Validate admin access code if role is admin
    if (role === 'admin' && adminAccessCode !== '0000') {
      return res.status(400).send("Invalid Admin Access Code");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, phonenumber, email, password: hashedPassword, role, adminAccessCode });
    await newUser.save();

    res.status(201).send("User registered successfully");
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).send("Server error");
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid credentials");
    }

    req.session.userId = user._id;
    req.session.userphonenumber = user.phonenumber;
    req.session.userRole = user.role;

    res.status(200).json({ message: "Login successful", role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server error");
  }
});

// Fetch user profile data
app.get('/userprofile', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).send("Unauthorized");
    }

    const user = await User.findById(req.session.userId).select('username phonenumber email');
    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).send("Server error");
  }
});
const ReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: String,
  description: String,
  location: String,
  category: String,
  status: {
    type: String,
    enum: ['Pending', 'Resolved'],
    default: 'Pending'
  },
  createdAt: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', ReportSchema);

app.get('/reports', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const query = {};

    // If the user is not an admin, restrict by userId
    if (req.session.userRole !== 'admin') {
      query.userId = req.session.userId;
    }

    if (req.query.category) query.category = req.query.category;
    if (req.query.status) query.status = req.query.status;

    const reports = await Report.find(query);
    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});



// Add a new report
app.post('/addreport', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { title, description, location, category } = req.body;

    const report = new Report({
      userId: req.session.userId, // associate the report with the logged-in user
      title,
      description,
      location,
      category,
      status: 'Pending'
    });

    await report.save();
    res.json({ success: true, message: 'Report added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add report' });
  }
});

// Update report status (set to 'Resolved')
app.put('/report/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {  
    const report = await Report.findById(id);

    // Check access rights
    if (!report || (req.session.userRole !== 'admin' && report.userId.toString() !== req.session.userId)) {
      return res.status(404).json({ message: 'Report not found or unauthorized' });
    }
    if (!['Pending', 'Resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

  

    report.status = status;
    await report.save();

    res.json({ success: true, message: 'Report status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update report status' });
  }
});


// Mark a report as resolved
app.put('/report/:id/resolve', async (req, res) => {
  const { id } = req.params;

  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const report = await Report.findById(id);
    if (!report || (req.session.userRole !== 'admin' && report.userId.toString() !== req.session.userId)) {
      return res.status(404).json({ message: 'Report not found or unauthorized' });
    }

    report.status = 'Resolved';
    await report.save();

    res.status(200).json({ message: 'Report resolved successfully' });
  } catch (err) {
    console.error('Error updating report status:', err);
    res.status(500).json({ message: 'Failed to resolve report' });
  }
});



app.delete('/report/:id', async (req, res) => {
  const { id } = req.params;

  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const report = await Report.findById(id);
    if (!report || (req.session.userRole !== 'admin' && report.userId.toString() !== req.session.userId)) {
      return res.status(404).json({ message: 'Report not found or not authorized' });
    }

    await Report.findByIdAndDelete(id);
    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('Error deleting report:', err);
    res.status(500).json({ message: 'Failed to delete report' });
  }
});












app.post('/logout', (req, res) => {
  if (req.session.userId) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Error during logout");
      }
      res.clearCookie('connect.sid');
      res.status(200).send({ status: "Logout successful" });  // Send JSON response
    });
  } else {
    res.status(400).send({ status: "No user is logged in" });
  }
});


// Start HTTPS server
https.createServer(sslOptions, app).listen(port, () => {
  console.log(`Server running at https://192.168.0.102:${port}`);
    // Automatically open the URL in the default web browser
    const url = `https://192.168.0.102:${port}`;

    // Check the operating system and run the appropriate command
    if (process.platform === 'win32') {
      exec(`start ${url}`);  // Windows
    } else if (process.platform === 'darwin') {
      exec(`open ${url}`);   // macOS
    } else {
      exec(`xdg-open ${url}`);  // Linux
    }
});

  