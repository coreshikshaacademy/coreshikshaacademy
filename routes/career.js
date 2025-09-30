
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const JobApplication = require('../models/JobApplication');

// Multer storage configuration for resumes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/resumes/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// @route   POST /api/career/apply
// @desc    Submit a job application
router.post('/apply', upload.single('resume'), async (req, res) => {
    try {
        const { name, email, phone, role, message } = req.body;

        if (!req.file) {
            return res.status(400).json({ msg: 'Please upload your resume.' });
        }

        if (!name || !email || !role || !message) {
            return res.status(400).json({ msg: 'Please fill out all required fields.' });
        }

        const newApplication = new JobApplication({
            name,
            email,
            phone,
            role,
            message,
            resumePath: req.file.path
        });

        const application = await newApplication.save();
        res.status(201).json({ msg: 'Application submitted successfully!', data: application });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

