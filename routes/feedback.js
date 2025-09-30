
const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// @route   POST /api/feedback
// @desc    Submit new feedback
router.post('/', async (req, res) => {
    try {
        const { name, message, rating } = req.body;

        if (!name || !message || !rating) {
            return res.status(400).json({ msg: 'Please provide name, message, and rating.' });
        }

        const newFeedback = new Feedback({
            name,
            message,
            rating
        });

        const feedback = await newFeedback.save();
        res.status(201).json({ msg: 'Feedback submitted successfully', data: feedback });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/feedback
// @desc    Get all feedback
router.get('/', async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ timestamp: -1 }); // Sort by newest first
        res.json(feedbacks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

