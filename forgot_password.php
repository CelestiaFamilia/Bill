<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0); // hide errors from user

$host = 'localhost';
$dbname = 'spending_tracker';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Read JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    $email = trim($input['email'] ?? '');
    $new_password = $input['new_password'] ?? '';

    if (empty($email) || empty($new_password)) {
        echo json_encode(['success' => false, 'message' => 'Email and new password are required.']);
        exit;
    }

    // Check if user exists
    $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Email not found.']);
        exit;
    }

    // Hash new password
    $hashed = password_hash($new_password, PASSWORD_DEFAULT);

    // Update password
    $update = $pdo->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
    $update->execute([$hashed, $email]);

    echo json_encode(['success' => true, 'message' => 'Password has been reset successfully!']);

} catch (Exception $e) {
    error_log("Forgot Password Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error. Please try again later.']);
}
?>