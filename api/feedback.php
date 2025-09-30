<?php
require_once 'config.php';

$response = ['status' => 'error', 'message' => 'Invalid request.'];

// Handle GET request to fetch all feedback
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $sql = "SELECT name, message, rating, timestamp FROM feedbacks ORDER BY timestamp DESC";
    $result = mysqli_query($conn, $sql);

    if ($result) {
        $feedbacks = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $feedbacks[] = $row;
        }
        http_response_code(200); // OK
        echo json_encode($feedbacks);
        mysqli_close($conn);
        exit; // Important to exit after sending response
    } else {
        http_response_code(500);
        $response['message'] = 'Could not fetch feedback from database.';
    }
}

// Handle POST request to submit new feedback
else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data);

    if (empty($data->name) || empty($data->message) || empty($data->rating)) {
        http_response_code(400);
        $response['message'] = 'Please provide name, message, and rating.';
    } else {
        $name = mysqli_real_escape_string($conn, trim($data->name));
        $message = mysqli_real_escape_string($conn, trim($data->message));
        $rating = (int)$data->rating;

        if ($rating < 1 || $rating > 5) {
            http_response_code(400);
            $response['message'] = 'Invalid rating value.';
        } else {
            $sql = "INSERT INTO feedbacks (name, message, rating) VALUES (?, ?, ?)";
            $stmt = mysqli_prepare($conn, $sql);

            if ($stmt) {
                mysqli_stmt_bind_param($stmt, "ssi", $name, $message, $rating);
                if (mysqli_stmt_execute($stmt)) {
                    http_response_code(201);
                    $response['status'] = 'success';
                    $response['message'] = 'Feedback submitted successfully!';

                    // --- Send Email Notification ---
                    $to = $notification_email;
                    $email_subject = "New Feedback Received (Rating: {$rating}/5)";
                    $email_body  = "A new feedback has been submitted.\n\n";
                    $email_body .= "Name: {$name}\n";
                    $email_body .= "Rating: {$rating} out of 5\n";
                    $email_body .= "Message:\n{$message}\n\n";
                    $email_body .= "Timestamp: " . date('Y-m-d H:i:s');
                    $headers = "From: no-reply@yourwebsite.com\r\n";

                    mail($to, $email_subject, $email_body, $headers);

                } else {
                    http_response_code(500);
                    $response['message'] = 'Database error: Could not save feedback.';
                }
                mysqli_stmt_close($stmt);
            } else {
                http_response_code(500);
                $response['message'] = 'Database error: Could not prepare statement.';
            }
        }
    }
}

else {
    http_response_code(405); // Method Not Allowed
    $response['message'] = 'This endpoint only accepts GET and POST requests.';
}

mysqli_close($conn);

header('Content-Type: application/json');
echo json_encode($response);
?>