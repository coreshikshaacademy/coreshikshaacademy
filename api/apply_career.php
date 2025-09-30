<?php
require_once 'config.php';

$response = ['status' => 'error', 'message' => 'An unknown error occurred.'];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // --- File Upload Handling ---
    $upload_dir = '../uploads/resumes/'; // Relative to the api directory
    $resume_file = isset($_FILES['resume']) ? $_FILES['resume'] : null;
    $resume_path_for_db = null;

    if (!$resume_file || $resume_file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        $response['message'] = 'Resume file is required and must be uploaded without errors.';
    } else {
        // Create a unique filename to prevent overwriting
        $file_ext = pathinfo($resume_file['name'], PATHINFO_EXTENSION);
        $unique_filename = 'resume-' . time() . '-' . uniqid() . '.' . $file_ext;
        $target_file = $upload_dir . $unique_filename;

        // For security, you should validate file type and size here.
        // For now, we trust the frontend, but server-side validation is crucial in production.

        if (move_uploaded_file($resume_file['tmp_name'], $target_file)) {
            $resume_path_for_db = 'uploads/resumes/' . $unique_filename; // Path to store in DB
        } else {
            http_response_code(500);
            $response['message'] = 'Failed to move uploaded file.';
            $resume_path_for_db = null; // Ensure we don't proceed
        }
    }

    // --- Process Form Data if file upload was successful ---
    if ($resume_path_for_db) {
        if (empty($_POST['name']) || empty($_POST['email']) || empty($_POST['role']) || empty($_POST['message'])) {
            http_response_code(400);
            $response['message'] = 'Please fill out all required fields.';
            // Clean up the uploaded file if validation fails
            unlink($target_file);
        } else {
            $name = mysqli_real_escape_string($conn, trim($_POST['name']));
            $email = mysqli_real_escape_string($conn, trim($_POST['email']));
            $phone = mysqli_real_escape_string($conn, trim($_POST['phone']));
            $role = mysqli_real_escape_string($conn, trim($_POST['role']));
            $message = mysqli_real_escape_string($conn, trim($_POST['message']));

            $sql = "INSERT INTO job_applications (name, email, phone, role, message, resumePath) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = mysqli_prepare($conn, $sql);

            if ($stmt) {
                mysqli_stmt_bind_param($stmt, "ssssss", $name, $email, $phone, $role, $message, $resume_path_for_db);
                if (mysqli_stmt_execute($stmt)) {
                    http_response_code(201);
                    $response['status'] = 'success';
                    $response['message'] = 'Application submitted successfully!';

                    // --- Send Email Notification ---
                    $to = $notification_email;
                    $email_subject = "New Job Application for: " . $role;
                    $email_body  = "A new job application has been received.\n\n";
                    $email_body .= "Name: {$name}\n";
                    $email_body .= "Email: {$email}\n";
                    $email_body .= "Phone: {$phone}\n";
                    $email_body .= "Applying for Role: {$role}\n";
                    $email_body .= "Cover Note:\n{$message}\n\n";
                    $email_body .= "Resume saved at: {$resume_path_for_db}\n";
                    $email_body .= "(You can access this file on your server.)\n\n";
                    $email_body .= "Timestamp: " . date('Y-m-d H:i:s');
                    $headers = "From: no-reply@yourwebsite.com\r\n";
                    $headers .= "Reply-To: {$email}\r\n";

                    mail($to, $email_subject, $email_body, $headers);

                } else {
                    http_response_code(500);
                    $response['message'] = 'Database error: Could not save application.';
                    unlink($target_file); // Clean up file if DB insert fails
                }
                mysqli_stmt_close($stmt);
            } else {
                http_response_code(500);
                $response['message'] = 'Database error: Could not prepare statement.';
                unlink($target_file); // Clean up file if DB prepare fails
            }
        }
    }
} else {
    http_response_code(405);
    $response['message'] = 'Only POST method is accepted.';
}

mysqli_close($conn);

header('Content-Type: application/json');
echo json_encode($response);
?>