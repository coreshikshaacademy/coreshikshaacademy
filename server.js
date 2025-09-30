const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Create upload directories if they don't exist ---
// Note: In a real hosting environment (like Heroku, Vercel), the filesystem might be ephemeral.
// It's often better to use a cloud storage service like AWS S3, Google Cloud Storage, or Cloudinary for file uploads.
const uploadsDir = path.join(__dirname, 'uploads');
const resumeDir = path.join(uploadsDir, 'resumes');
const studentDocsDir = path.join(uploadsDir, 'student_docs');
const techDocsDir = path.join(uploadsDir, 'tech_docs');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(resumeDir)) fs.mkdirSync(resumeDir);
if (!fs.existsSync(studentDocsDir)) fs.mkdirSync(studentDocsDir);
if (!fs.existsSync(techDocsDir)) fs.mkdirSync(techDocsDir);
// ---

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Serve all static files from the project root directory
app.use(express.static(__dirname));

// --- Database Connection ---
// For deployment, you MUST use a cloud MongoDB service like MongoDB Atlas.
// Your hosting provider (e.g., Vercel, Heroku, Railway) will have a section for "Environment Variables".
// You should create a variable named MONGODB_URI and paste your MongoDB Atlas connection string there.
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coer_shiksha_db';

mongoose.connect(dbURI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log('MongoDB connection error:', err));

// --- API Routes ---
const studentRegRoutes = require('./routes/studentRegistration');
const techRegRoutes = require('./routes/technicalRegistration');
const feedbackRoutes = require('./routes/feedback');
const contactRoutes = require('./routes/contact');
const careerRoutes = require('./routes/career');

app.use('/api/register/student', studentRegRoutes);
app.use('/api/register/technical', techRegRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/career', careerRoutes);

// --- Serve HTML Pages ---
// This ensures that navigating to different pages works correctly.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Add routes for all your other HTML pages
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about us', 'aboutus.html'));
});

app.get('/courses', (req, res) => {
    res.sendFile(path.join(__dirname, 'our_courses', 'courses.html'));
});

app.get('/career', (req, res) => {
    res.sendFile(path.join(__dirname, 'career', 'career.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact us', 'contact.html'));
});

app.get('/feedback', (req, res) => {
    res.sendFile(path.join(__dirname, 'feedback', 'feedback.html'));
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});