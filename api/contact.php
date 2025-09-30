<?php
// Include the database configuration file
require_once 'config.php';

// The response array
$response = ['status' => 'error', 'message' => 'An unknown error occurred.'];

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get the raw POST data
    $json_data = file_get_contents('php://input');
    // Decode the JSON data
    $data = json_decode($json_data);

    // --- Basic Validation ---
    if (empty($data->name) || empty($data->email) || empty($data->phone) || empty($data->subject) || empty($data->message)) {
        http_response_code(400); // Bad Request
        $response['message'] = 'Please fill out all fields.';
    } else {
        // Sanitize input data
        $name = mysqli_real_escape_string($conn, trim($data->name));
        $email = mysqli_real_escape_string($conn, trim($data->email));
        $phone = mysqli_real_escape_string($conn, trim($data->phone));
        $subject = mysqli_real_escape_string($conn, trim($data->subject));
        $message = mysqli_real_escape_string($conn, trim($data->message));

        // --- Insert into Database ---
        $sql = "INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)";
        
        $stmt = mysqli_prepare($conn, $sql);
        if ($stmt) {
            mysqli_stmt_bind_param($stmt, "sssss", $name, $email, $phone, $subject, $message);
            
            if (mysqli_stmt_execute($stmt)) {
                http_response_code(201); // Created
                $response['status'] = 'success';
                $response['message'] = 'Message sent successfully!';

                // --- Send Email Notification ---
                $to = $notification_email;
                $email_subject = "New Contact Form Submission: " . $subject;
                $email_body  = "A new message has been submitted through the contact form.\n\n";
                $email_body .= "Name: {$name}\n";
                $email_body .= "Email: {$email}\n";
                $email_body .= "Phone: {$phone}\n";
                $email_body .= "Subject: {$subject}\n";
                $email_body .= "Message:\n{$message}\n\n";
                $email_body .= "Timestamp: " . date('Y-m-d H:i:s');

                $headers = "From: no-reply@yourwebsite.com\r\n"; // Replace with a from address if your hosting allows
                $headers .= "Reply-To: {$email}\r\n";

                // Use mail() function. Note: Hosting server must be configured to send emails.
                mail($to, $email_subject, $email_body, $headers);

            } else {
                http_response_code(500); // Internal Server Error
                $response['message'] = 'Database error: Could not save the message.';
            }
            mysqli_stmt_close($stmt);
        } else {
            http_response_code(500);
            $response['message'] = 'Database error: Could not prepare the statement.';
        }
    }
} else {
    http_response_code(405); // Method Not Allowed
    $response['message'] = 'Only POST method is accepted.';
}

// Close the database connection
mysqli_close($conn);

// Send the JSON response
header('Content-Type: application/json');
echo json_encode($response);
?>