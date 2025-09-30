<?php
require_once 'config.php';

$response = ['status' => 'error', 'message' => 'An unknown error occurred.'];
$uploaded_files = []; // To track uploaded files for cleanup on error

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // --- File Upload Handling ---
    $upload_dir = '../uploads/tech_docs/';
    $file_paths_for_db = [
        'photoURL' => null,
        'qualificationURL' => null,
        'aadhaarURL' => null
    ];
    $upload_error = false;

    // Required files
    $required_files = ['photo', 'lastQualificationFile'];
    foreach ($required_files as $field) {
        if (isset($_FILES[$field]) && $_FILES[$field]['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES[$field];
            $file_ext = pathinfo($file['name'], PATHINFO_EXTENSION);
            $unique_filename = $field . '-' . time() . '-' . uniqid() . '.' . $file_ext;
            $target_file = $upload_dir . $unique_filename;

            if (move_uploaded_file($file['tmp_name'], $target_file)) {
                $file_paths_for_db[$field == 'photo' ? 'photoURL' : 'qualificationURL'] = 'uploads/tech_docs/' . $unique_filename;
                $uploaded_files[] = $target_file;
            } else {
                $upload_error = true;
                $response['message'] = "Failed to move uploaded file: {$field}";
                break;
            }
        } else {
            $upload_error = true;
            $response['message'] = "Required file is missing or has an upload error: {$field}";
            break;
        }
    }

    // Optional file (Aadhaar)
    if (!$upload_error && isset($_FILES['aadhaarFile']) && $_FILES['aadhaarFile']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['aadhaarFile'];
        $file_ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $unique_filename = 'aadhaar-' . time() . '-' . uniqid() . '.' . $file_ext;
        $target_file = $upload_dir . $unique_filename;
        if (move_uploaded_file($file['tmp_name'], $target_file)) {
            $file_paths_for_db['aadhaarURL'] = 'uploads/tech_docs/' . $unique_filename;
            $uploaded_files[] = $target_file;
        } // Not treating optional file upload failure as a fatal error
    }

    // --- Process Form Data if required uploads were successful ---
    if (!$upload_error) {
        $required_post = ['fullName', 'mobile', 'currentlyStudying', 'highestQualification', 'course', 'duration', 'mode'];
        $missing_fields = false;
        foreach ($required_post as $field) {
            if (empty($_POST[$field])) {
                $missing_fields = true;
                $response['message'] = "Missing required form field: {$field}";
                break;
            }
        }

        if ($missing_fields) {
            http_response_code(400);
        } else {
            // Prepare all variables, using null for optional empty ones
            $params = [];
            $fields = ['fullName', 'fatherName', 'motherName', 'dob', 'gender', 'mobile', 'email', 'currentlyStudying', 'classOrYear', 'schoolCollegeName', 'highestQualification', 'course', 'courseOther', 'duration', 'customDuration', 'mode', 'preferredStart', 'altMobile', 'emergencyContactName', 'address', 'district', 'aadhaarNumber', 'feeOption', 'howDidYouKnow', 'notes'];
            foreach ($fields as $field) {
                $params[$field] = !empty($_POST[$field]) ? mysqli_real_escape_string($conn, $_POST[$field]) : NULL;
            }

            $sql = "INSERT INTO technical_registrations (fullName, fatherName, motherName, dob, gender, mobile, email, currentlyStudying, classOrYear, schoolCollegeName, highestQualification, course, courseOther, duration, customDuration, mode, preferredStart, altMobile, emergencyContactName, address, district, aadhaarNumber, feeOption, howDidYouKnow, notes, photoURL, qualificationURL, aadhaarURL) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = mysqli_prepare($conn, $sql);

            if ($stmt) {
                mysqli_stmt_bind_param($stmt, 'ssssssssssssssssssssssssssss',
                    $params['fullName'], $params['fatherName'], $params['motherName'], $params['dob'], $params['gender'],
                    $params['mobile'], $params['email'], $params['currentlyStudying'], $params['classOrYear'], $params['schoolCollegeName'],
                    $params['highestQualification'], $params['course'], $params['courseOther'], $params['duration'], $params['customDuration'],
                    $params['mode'], $params['preferredStart'], $params['altMobile'], $params['emergencyContactName'], $params['address'],
                    $params['district'], $params['aadhaarNumber'], $params['feeOption'], $params['howDidYouKnow'], $params['notes'],
                    $file_paths_for_db['photoURL'], $file_paths_for_db['qualificationURL'], $file_paths_for_db['aadhaarURL']
                );

                if (mysqli_stmt_execute($stmt)) {
                    http_response_code(201);
                    $response['status'] = 'success';
                    $response['message'] = 'Technical course registration successful!';

                    // --- Send Email Notification ---
                    $to = $notification_email;
                    $email_subject = "New Technical Course Registration: " . $params['fullName'];
                    $email_body = "A new registration for a technical course has been submitted.\n\n";
                    foreach($params as $key => $value) {
                        if ($value) { // Only include fields that have a value
                            $email_body .= ucwords(preg_replace('/(?<!^)[A-Z]/', ' $0', $key)) . ": {$value}\n";
                        }
                    }
                    $email_body .= "\n--- Documents ---\\n";
                    $email_body .= "Photo Path: {$file_paths_for_db['photoURL']}\n";
                    $email_body .= "Qualification Certificate Path: {$file_paths_for_db['qualificationURL']}\n";
                    if ($file_paths_for_db['aadhaarURL']) {
                        $email_body .= "Aadhaar Card Path: {$file_paths_for_db['aadhaarURL']}\n";
                    }
                    $headers = "From: no-reply@yourwebsite.com\r\nReply-To: {$params['email']}\r\n";
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

    // Cleanup on any error
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