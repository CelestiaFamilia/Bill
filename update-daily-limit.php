<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$newLimit = isset($data['daily_limit']) ? (float)$data['daily_limit'] : null;

if ($newLimit === null || $newLimit < 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid daily limit']);
    exit;
}

$user_id = (int)$_SESSION['user_id'];

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
    
    $stmt = $pdo->prepare("UPDATE users SET daily_limit = ?, updated_at = NOW() WHERE user_id = ?");
    if ($stmt->execute([$newLimit, $user_id])) {
        echo json_encode(['success' => true, 'message' => 'Daily limit updated']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update']);
    }

} catch (\PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}