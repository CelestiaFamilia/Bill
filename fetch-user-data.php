<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

$user_id = (int)$_SESSION['user_id'];
$date = $_GET['date'] ?? date('Y-m-d');

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
    
    // Fetch user
    $stmt = $pdo->prepare("SELECT user_id, full_name, gender, birthday, phone, email, address, daily_limit FROM users WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['success' => false, 'error' => 'User not found']);
        exit;
    }

    // Fetch spending for the date
    $stmt = $pdo->prepare("
        SELECT c.category_name, COALESCE(SUM(s.amount), 0) as amount
        FROM category c
        LEFT JOIN spending s ON c.category_id = s.category_id AND s.user_id = ? AND s.spending_date = ?
        GROUP BY c.category_id, c.category_name
    ");
    $stmt->execute([$user_id, $date]);
    $byCategory = [];
    while ($row = $stmt->fetch()) {
        $byCategory[$row['category_name']] = [
            'amount' => (float)$row['amount']
        ];
    }

    $total = array_sum(array_column($byCategory, 'amount'));

    echo json_encode([
        'success' => true,
        'user' => [
            'name' => $user['full_name'],
            'gender' => $user['gender'],
            'birthday' => $user['birthday'],
            'phone' => $user['phone'],
            'email' => $user['email'],
            'address' => $user['address'],
            'dailyLimit' => (float)$user['daily_limit'] // ✅ Include daily_limit
        ],
        'spending' => [
            'date' => $date,
            'total' => $total,
            'byCategory' => $byCategory
        ]
    ]);

} catch (\PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error']);
    error_log($e->getMessage());
}