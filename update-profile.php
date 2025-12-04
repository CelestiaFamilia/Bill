<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'No data received']);
    exit;
}

$user_id = (int)$_SESSION['user_id'];
$full_name = trim($data['name'] ?? '');
$gender = trim($data['gender'] ?? '');
$birthday = trim($data['birthday'] ?? '');
$phone = trim($data['phone'] ?? '');
$email = trim($data['email'] ?? '');
$address = trim($data['address'] ?? '');

if (empty($full_name)) {
    echo json_encode(['success' => false, 'message' => 'Name is required']);
    exit;
}

if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

// Database config
$host = 'localhost';
$db   = 'spending_tracker';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$opt = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $opt);
} catch (\PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

$stmt = $pdo->prepare("
    UPDATE users 
    SET full_name = ?, gender = ?, birthday = ?, phone = ?, email = ?, address = ?, updated_at = NOW() 
    WHERE user_id = ?
");
if ($stmt->execute([$full_name, $gender, $birthday, $phone, $email, $address, $user_id])) {
    echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
}
?>