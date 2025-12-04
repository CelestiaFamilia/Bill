<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

$user_id = (int)$_SESSION['user_id'];
$period = $_GET['period'] ?? 'daily';
$date = $_GET['date'] ?? date('Y-m-d');

$validPeriods = ['daily', 'weekly', 'monthly', 'yearly'];
if (!in_array($period, $validPeriods)) {
    echo json_encode(['success' => false, 'error' => 'Invalid period']);
    exit;
}

try {
    $pdo = new PDO('mysql:host=localhost;dbname=spending_tracker;charset=utf8mb4', 'root', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    switch ($period) {
        case 'daily':
            $condition = "s.spending_date = ?";
            $params = [$date];
            break;

        case 'weekly':
            $dt = new DateTime($date);
            $dt->modify('monday this week');
            $start = $dt->format('Y-m-d');
            $dt->modify('+6 days');
            $end = $dt->format('Y-m-d');
            $condition = "s.spending_date BETWEEN ? AND ?";
            $params = [$start, $end];
            break;

        case 'monthly':
            $yearMonth = substr($date, 0, 7);
            $condition = "s.spending_date LIKE ?";
            $params = ["$yearMonth-%"];
            break;

        case 'yearly':
            $year = substr($date, 0, 4);
            $condition = "s.spending_date LIKE ?";
            $params = ["$year-%"];
            break;
    }

    $sql = "
        SELECT 
            c.category_name,
            COALESCE(SUM(s.amount), 0) AS total_amount
        FROM category c
        LEFT JOIN spending s 
            ON c.category_id = s.category_id 
            AND s.user_id = ? 
            AND $condition
        GROUP BY c.category_id, c.category_name
        ORDER BY c.category_id
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(array_merge([$user_id], $params));

    $categoryTotals = [];
    while ($row = $stmt->fetch()) {
        $categoryTotals[$row['category_name']] = (float)$row['total_amount'];
    }

    $expectedCategories = ['Food', 'Groceries', 'Transportation', 'Load/Subscription'];
    foreach ($expectedCategories as $cat) {
        if (!isset($categoryTotals[$cat])) {
            $categoryTotals[$cat] = 0.0;
        }
    }

    $total = array_sum($categoryTotals);

    echo json_encode([
        'success' => true,
        'total' => $total,
        'categoryTotals' => $categoryTotals
    ]);

} catch (Exception $e) {
    error_log('Breakdown fetch error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error']);
}