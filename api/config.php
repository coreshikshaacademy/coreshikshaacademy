<?php
// ===== CONFIGURATION =====
// **1. DATABASE DETAILS (Update with your hosting database details)**
$db_host = 'localhost';      // Usually 'localhost'
$db_user = 'YOUR_DB_USER';       // Your database username from hosting
$db_pass = 'YOUR_DB_PASSWORD';   // Your database password from hosting
$db_name = 'YOUR_DB_NAME';       // Your database name from hosting

// **2. EMAIL NOTIFICATION**
$notification_email = 'coreshikshaacademy21@gmail.com';

// **3. CORS (Cross-Origin Resource Sharing) SETTINGS**
// Allows your frontend (e.g., on Netlify) to talk to this backend.
// For development, '*' is okay. For production, you should change '*' to your actual frontend domain.
// Example: header('Access-Control-Allow-Origin: https://your-site.netlify.app');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// **4. TIMEZONE**
date_default_timezone_set('Asia/Kolkata');

// ===== DATABASE CONNECTION =====
$conn = mysqli_connect($db_host, $db_user, $db_pass, $db_name);

// Check connection
if (!$conn) {
    // Don't show detailed errors in production for security reasons.
    // Instead, you can log them to a file.
    // error_log('Database Connection Error: ' . mysqli_connect_error());
    http_response_code(500); // Internal Server Error
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed.']);
    die();
}

// Handle pre-flight OPTIONS request (for CORS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(204); // No Content
    exit;
}

?>