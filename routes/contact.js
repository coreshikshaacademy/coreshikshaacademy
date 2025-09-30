
const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');

// @route   POST /api/contact
// @desc    Save a new contact message
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !phone || !subject || !message) {
            return res.status(400).json({ msg: 'Please fill out all fields.' });
        }

        const newMessage = new ContactMessage({
            name,
            email,
            phone,
            subject,
            message
        });

        const savedMessage = await newMessage.save();
        res.status(201).json({ msg: 'Message sent successfully!', data: savedMessage });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

