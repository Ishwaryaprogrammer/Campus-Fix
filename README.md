# 🏫 CampusFix – Campus Issue Reporting System

CampusFix is a full-stack web application that allows students to report campus issues and enables administrators to manage them effectively. The system features user-friendly reporting, real-time filtering, and admin functionalities like status updates and deletion.

## 🚀 Features

- 📝 Report campus issues with title, description, location, category, and status.
- 🔍 Admin dashboard to view all reports.
- 🧹 Filter reports by **category** and **status**.
- ✅ Mark issues as **resolved**.
- ❌ Delete irrelevant or resolved reports.

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Database**: MongoDB (via Mongoose)
- **Others**: REST APIs, Fetch API


## 🧪 Setup Instructions

1. **Clone the repo:**
   ```bash
   git clone https://github.com/yourusername/campusfix.git
   cd campusfix
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root:
   ```env
   MONGO_URI=your_mongodb_connection_string
   ```

4. **Run the server:**
   ```bash
   node app.js
   ```

5. **Open the dashboard:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

