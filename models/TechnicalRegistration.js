
const mongoose = require('mongoose');

const TechnicalRegistrationSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    fatherName: { type: String },
    motherName: { type: String },
    dob: { type: Date },
    gender: { type: String },
    mobile: { type: String, required: true },
    email: { type: String },
    currentlyStudying: { type: String, required: true },
    classOrYear: { type: String },
    schoolCollegeName: { type: String },
    highestQualification: { type: String, required: true },
    course: { type: String, required: true },
    courseOther: { type: String },
    duration: { type: String, required: true },
    customDuration: { type: String },
    mode: { type: String, required: true },
    preferredStart: { type: Date },
    altMobile: { type: String },
    emergencyContactName: { type: String },
    address: { type: String },
    district: { type: String },
    aadhaarNumber: { type: String },
    feeOption: { type: String },
    howDidYouKnow: { type: String },
    notes: { type: String },
    photoURL: { type: String, required: true },
    qualificationURL: { type: String, required: true },
    aadhaarURL: { type: String },
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TechnicalRegistration', TechnicalRegistrationSchema);

