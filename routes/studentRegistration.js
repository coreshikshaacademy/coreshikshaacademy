
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const StudentRegistration = require('../models/StudentRegistration');

// Multer storage configuration for student documents
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/student_docs/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// @route   POST /api/register/student
// @desc    Register a new student
router.post('/', upload.fields([{ name: 'aadhaar_file', maxCount: 1 }, { name: 'certificate_file', maxCount: 1 }]), async (req, res) => {
    try {
        const {
            name, gender, dob, email, contact, address, state, city, country,
            school_name, class: studentClass, stream, class_mode
        } = req.body;

        if (!req.files['aadhaar_file'] || !req.files['certificate_file']) {
            return res.status(400).json({ msg: 'Please upload both Aadhaar and Certificate files.' });
        }

        const newRegistration = new StudentRegistration({
            name,
            gender,
            dob,
            email,
            contact,
            address,
            state,
            city,
            country,
            school_name,
            class: studentClass,
            stream,
            class_mode,
            aadhaar_link: req.files['aadhaar_file'][0].path,
            certificate_link: req.files['certificate_file'][0].path
        });

        const registration = await newRegistration.save();
        res.status(201).json({ msg: 'Registration successful', data: registration });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

