<?php
require_once 'config.php';

$response = ['status' => 'error', 'message' => 'An unknown error occurred.'];
$uploaded_files = []; // Keep track of successfully uploaded files for cleanup

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // --- File Upload Handling ---
    $upload_dir = '../uploads/student_docs/';
    $file_fields = ['aadhaar_file', 'certificate_file'];
    $file_paths_for_db = [];
    $upload_error = false;

    foreach ($file_fields as $field) {
        if (isset($_FILES[$field]) && $_FILES[$field]['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES[$field];
            $file_ext = pathinfo($file['name'], PATHINFO_EXTENSION);
            $unique_filename = $field . '-' . time() . '-' . uniqid() . '.' . $file_ext;
            $target_file = $upload_dir . $unique_filename;

            if (move_uploaded_file($file['tmp_name'], $target_file)) {
                $file_paths_for_db[$field] = 'uploads/student_docs/' . $unique_filename;
                $uploaded_files[] = $target_file;
            } else {
                $upload_error = true;
                $response['message'] = "Failed to move uploaded file: {$field}";
                break;
            }
        } else {
            $upload_error = true;
            $response['message'] = "File upload error or missing file for: {$field}";
            break;
        }
    }

    // --- Process Form Data if all uploads were successful ---
    if (!$upload_error) {
        // Check for required POST fields
        $required_fields = ['name', 'gender', 'dob', 'email', 'contact', 'address', 'state', 'city', 'country', 'school_name', 'class', 'class_mode'];
        $missing_fields = false;
        foreach ($required_fields as $field) {
            if (empty($_POST[$field])) {
                $missing_fields = true;
                break;
            }
        }

        if ($missing_fields) {
            http_response_code(400);
            $response['message'] = 'Please fill out all required form fields.';
        } else {
            // Sanitize and prepare data
            $name = mysqli_real_escape_string($conn, $_POST['name']);
            $gender = mysqli_real_escape_string($conn, $_POST['gender']);
            $dob = mysqli_real_escape_string($conn, $_POST['dob']);
            $email = mysqli_real_escape_string($conn, $_POST['email']);
            $contact = mysqli_real_escape_string($conn, $_POST['contact']);
            $address = mysqli_real_escape_string($conn, $_POST['address']);
            $state = mysqli_real_escape_string($conn, $_POST['state']);
            $city = mysqli_real_escape_string($conn, $_POST['city']);
            $country = mysqli_real_escape_string($conn, $_POST['country']);
            $school_name = mysqli_real_escape_string($conn, $_POST['school_name']);
            $student_class = mysqli_real_escape_string($conn, $_POST['class']);
            $stream = isset($_POST['stream']) ? mysqli_real_escape_string($conn, $_POST['stream']) : NULL;
            $class_mode = mysqli_real_escape_string($conn, $_POST['class_mode']);

            $sql = "INSERT INTO student_registrations (name, gender, dob, email, contact, address, state, city, country, school_name, class, stream, class_mode, aadhaar_link, certificate_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = mysqli_prepare($conn, $sql);

            if ($stmt) {
                mysqli_stmt_bind_param($stmt, "sssssssssssssss", $name, $gender, $dob, $email, $contact, $address, $state, $city, $country, $school_name, $student_class, $stream, $class_mode, $file_paths_for_db['aadhaar_file'], $file_paths_for_db['certificate_file']);
                
                if (mysqli_stmt_execute($stmt)) {
                    http_response_code(201);
                    $response['status'] = 'success';
                    $response['message'] = 'Registration successful!';

                    // --- Send Email Notification ---
                    $to = $notification_email;
                    $email_subject = "New Student Registration: " . $name;
                    $email_body = "A new student has registered.\n\n--- Personal Details ---\n";
                    $email_body .= "Name: {$name}\nGender: {$gender}\nDOB: {$dob}\nEmail: {$email}\nContact: {$contact}\nAddress: {$address}, {$city}, {$state}, {$country}\n";
                    $email_body .= "\n--- Educational Details ---\n";
                    $email_body .= "School: {$school_name}\nClass: {$student_class}\nStream: {$stream}\nMode: {$class_mode}\n";
                    $email_body .= "\n--- Documents ---\n";
                    $email_body .= "Aadhaar Card Path: {$file_paths_for_db['aadhaar_file']}\n";
                    $email_body .= "Certificate Path: {$file_paths_for_db['certificate_file']}\n";
                    $email_body .= "(You can access these files on your server.)\n";
                    $headers = "From: no-reply@yourwebsite.com\r\nReply-To: {$email}\r\n";
                    mail($to, $email_subject, $email_body, $headers);

                } else {
                    http_response_code(500);
                    $response['message'] = 'Database error: Could not save registration.';
                }
                mysqli_stmt_close($stmt);
            } else {
                http_response_code(500);
                $response['message'] = 'Database error: Could not prepare statement.';
            }
        }
    }

    // If there was an error at any point, clean up uploaded files
    if ($response['status'] === 'error' && !empty($uploaded_files)) {
        foreach ($uploaded_files as $file_to_delete) {
            if (file_exists($file_to_delete)) {
                unlink($file_to_delete);
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