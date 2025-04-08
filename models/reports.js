const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    title: String,
    description: String,
    location: String,
    category: String,
    
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }  // Ensure user ID is required
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
