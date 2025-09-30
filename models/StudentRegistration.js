
const mongoose = require('mongoose');

const StudentRegistrationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: Date, required: true },
    email: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    school_name: { type: String, required: true },
    class: { type: String, required: true },
    stream: { type: String },
    class_mode: { type: String, required: true },
    aadhaar_link: { type: String, required: true },
    certificate_link: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudentRegistration', StudentRegistrationSchema);

