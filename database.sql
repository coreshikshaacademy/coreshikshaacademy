-- SQL script for creating the database tables for the Core Shiksha Academy website.
-- Hostinger/GoDaddy provides phpMyAdmin to run this script.

-- 1. Table for Student Registrations
-- This table stores data from the main student registration form.
CREATE TABLE `student_registrations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `gender` VARCHAR(50) NOT NULL,
  `dob` DATE NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `contact` VARCHAR(50) NOT NULL,
  `address` TEXT NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `country` VARCHAR(100) NOT NULL,
  `school_name` VARCHAR(255) NOT NULL,
  `class` VARCHAR(50) NOT NULL,
  `stream` VARCHAR(100),
  `class_mode` VARCHAR(50) NOT NULL,
  `aadhaar_link` VARCHAR(255) NOT NULL,
  `certificate_link` VARCHAR(255) NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table for Technical Course Registrations
-- This table stores data from the technical course registration form.
CREATE TABLE `technical_registrations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `fullName` VARCHAR(255) NOT NULL,
  `fatherName` VARCHAR(255),
  `motherName` VARCHAR(255),
  `dob` DATE,
  `gender` VARCHAR(50),
  `mobile` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255),
  `currentlyStudying` VARCHAR(100) NOT NULL,
  `classOrYear` VARCHAR(100),
  `schoolCollegeName` VARCHAR(255),
  `highestQualification` VARCHAR(100) NOT NULL,
  `course` VARCHAR(255) NOT NULL,
  `courseOther` VARCHAR(255),
  `duration` VARCHAR(100) NOT NULL,
  `customDuration` VARCHAR(255),
  `mode` VARCHAR(50) NOT NULL,
  `preferredStart` DATE,
  `altMobile` VARCHAR(50),
  `emergencyContactName` VARCHAR(255),
  `address` TEXT,
  `district` VARCHAR(100),
  `aadhaarNumber` VARCHAR(20),
  `feeOption` VARCHAR(100),
  `howDidYouKnow` VARCHAR(100),
  `notes` TEXT,
  `photoURL` VARCHAR(255) NOT NULL,
  `qualificationURL` VARCHAR(255) NOT NULL,
  `aadhaarURL` VARCHAR(255),
  `submittedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table for Job Applications (Career Page)
-- This table stores submissions from the career application form.
CREATE TABLE `job_applications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50),
  `role` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `resumePath` VARCHAR(255) NOT NULL,
  `submittedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table for Contact Form Messages
-- This table stores messages from the "Contact Us" page.
CREATE TABLE `contact_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `submittedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table for Feedback
-- This table stores feedback and ratings from the feedback form.
CREATE TABLE `feedbacks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `rating` INT NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

