<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$category_id = (int)($input['category_id'] ?? 0);
$spending_date = trim($input['spending_date'] ?? '');

if (!$category_id || !$spending_date || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $spending_date)) {
    echo json_encode(['success' => false, 'message' => 'Invalid input.']);
    exit;
}

try {
    $pdo = new PDO('mysql:host=localhost;dbname=spending_tracker;charset=utf8mb4', 'root', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $stmt = $pdo->prepare("DELETE FROM spending WHERE user_id = ? AND category_id = ? AND spending_date = ?");
    $stmt->execute([$_SESSION['user_id'], $category_id, $spending_date]);

    echo json_encode(['success' => true, 'message' => 'Spending deleted.']);
} catch (Exception $e) {
    error_log('Delete error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error.']);
}