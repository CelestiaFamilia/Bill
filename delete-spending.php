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
    $pdo = new PDO('mysql:host=localhost;dbname=spending_tracker', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->prepare("DELETE FROM spending WHERE user_id = ? AND category_id = ? AND DATE(spending_date) = ?");
    $deleted = $stmt->execute([$_SESSION['user_id'], $category_id, $spending_date]);

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error.']);
}