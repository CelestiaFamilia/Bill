<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? '*'));
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Database config — same as signin.php
$host = 'localhost';
$dbname = 'spending_tracker';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('POST method required.');
    }

    $email = trim($_POST['email'] ?? '');
    $newPassword = $_POST['new_password'] ?? '';

    if (empty($email) || empty($newPassword)) {
        echo json_encode(['success' => false, 'message' => 'Email and new password are required.']);
        exit;
    }

    if (strlen($newPassword) < 6) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
        exit;
    }

    // Check if email exists
    $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = :email");
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->execute();

    if (!$stmt->fetch(PDO::FETCH_ASSOC)) {
        echo json_encode(['success' => false, 'message' => 'Email not found in our system.']);
        exit;
    }

    // Hash the new password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Update password
    $updateStmt = $pdo->prepare("UPDATE users SET password_hash = :password WHERE email = :email");
    $updateStmt->bindParam(':password', $hashedPassword, PDO::PARAM_STR);
    $updateStmt->bindParam(':email', $email, PDO::PARAM_STR);
    $updateStmt->execute();

    echo json_encode([
        'success' => true,
        'message' => 'Password updated successfully! You can now sign in.'
    ]);

} catch (Exception $e) {
    error_log("Reset Password Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update password. Please try again later.'
    ]);
}
?>