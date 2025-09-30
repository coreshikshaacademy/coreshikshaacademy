
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const TechnicalRegistration = require('../models/TechnicalRegistration');

// Multer storage configuration for technical course documents
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/tech_docs/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// @route   POST /api/register/technical
// @desc    Register for a technical course
const fileUploads = upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'aadhaarFile', maxCount: 1 },
    { name: 'lastQualificationFile', maxCount: 1 }
]);

router.post('/', fileUploads, async (req, res) => {
    try {
        // Destructure form fields from req.body
        const {
            fullName, fatherName, motherName, dob, gender, mobile, email,
            currentlyStudying, classOrYear, schoolCollegeName, highestQualification,
            course, courseOther, duration, customDuration, mode, preferredStart,
            altMobile, emergencyContactName, address, district, aadhaarNumber,
            feeOption, howDidYouKnow, notes
        } = req.body;

        // Check for required files
        if (!req.files['photo'] || !req.files['lastQualificationFile']) {
            return res.status(400).json({ msg: 'Please upload photo and qualification certificate.' });
        }

        const newRegistration = new TechnicalRegistration({
            fullName, fatherName, motherName, dob, gender, mobile, email,
            currentlyStudying, classOrYear, schoolCollegeName, highestQualification,
            course, courseOther, duration, customDuration, mode, preferredStart,
            altMobile, emergencyContactName, address, district, aadhaarNumber,
            feeOption, howDidYouKnow, notes,
            photoURL: req.files['photo'][0].path,
            qualificationURL: req.files['lastQualificationFile'][0].path,
            aadhaarURL: req.files['aadhaarFile'] ? req.files['aadhaarFile'][0].path : null
        });

        const registration = await newRegistration.save();
        res.status(201).json({ msg: 'Technical course registration successful', data: registration });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

