<?php
session_start();

// Check authentication
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

// Get raw input
$data = json_decode(file_get_contents('php://input'), true);

// Validate input
$amount = isset($data['amount']) ? (float)$data['amount'] : null;
$category_id = isset($data['category_id']) ? (int)$data['category_id'] : null;
$spending_date = isset($data['spending_date']) ? trim($data['spending_date']) : null;

if ($amount <= 0 || !$category_id || !$spending_date) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

// Validate date format (YYYY-MM-DD)
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $spending_date)) {
    echo json_encode(['success' => false, 'message' => 'Invalid date format']);
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

    // Optional: Verify category_id exists (security)
    $stmt = $pdo->prepare("SELECT 1 FROM category WHERE category_id = ?");
    $stmt->execute([$category_id]);
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Invalid category']);
        exit;
    }

    // Insert spending
    $stmt = $pdo->prepare("
        INSERT INTO spending (user_id, category_id, amount, spending_date)
        VALUES (?, ?, ?, ?)
    ");
    
    if ($stmt->execute([$user_id, $category_id, $amount, $spending_date])) {
        echo json_encode(['success' => true, 'message' => 'Spending recorded']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to save spending']);
    }

} catch (\PDOException $e) {
    error_log("Spending save error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error']);
}