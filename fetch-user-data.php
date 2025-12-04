<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

$user_id = (int)$_SESSION['user_id'];
$date = $_GET['date'] ?? date('Y-m-d');

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    echo json_encode(['success' => false, 'error' => 'Invalid date format']);
    exit;
}

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
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

$stmt = $pdo->prepare("
    SELECT full_name, email, phone, gender, birthday, address, 
           profile_picture, daily_limit 
    FROM users 
    WHERE user_id = ?
");
$stmt->execute([$user_id]);
$user = $stmt->fetch();

if (!$user) {
    echo json_encode(['success' => false, 'error' => 'User not found']);
    exit;
}

// 🔥 THIS IS THE ONLY QUERY THAT MATTERS 🔥
$stmt = $pdo->prepare("
    SELECT c.category_name, SUM(s.amount) as total
    FROM spending s
    JOIN category c ON s.category_id = c.category_id
    WHERE s.user_id = ? AND s.spending_date = ?
    GROUP BY c.category_id, c.category_name
");
$stmt->execute([$user_id, $date]);
$spendingRows = $stmt->fetchAll();

$byCategory = [];
$totalSpent = 0;
foreach ($spendingRows as $row) {
    $key = $row['category_name'];
    $amount = (float)$row['total'];
    $byCategory[$key] = ['amount' => $amount];
    $totalSpent += $amount;
}

echo json_encode([
    'success' => true,
    'user' => [
        'name' => $user['full_name'],
        'email' => $user['email'],
        'phone' => $user['phone'],
        'gender' => $user['gender'],
        'birthday' => $user['birthday'],
        'address' => $user['address'],
        'profileImage' => $user['profile_picture'],
        'dailyLimit' => (float)($user['daily_limit'] ?? 0)
    ],
    'spending' => [
        'date' => $date,
        'total' => $totalSpent,
        'byCategory' => $byCategory
    ]
]);
?>