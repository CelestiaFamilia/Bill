<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// Capture all output to prevent accidental HTML/whitespace
ob_start();

try {
    // Database config
    $host = 'localhost';
    $db   = 'spending_tracker';
    $user = 'root';
    $pass = '';
    $charset = 'utf8mb4';

    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    $pdo = new PDO($dsn, $user, $pass, $options);

} catch (Exception $e) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$name = trim($input['name'] ?? '');
$email = strtolower(trim($input['email'] ?? ''));
$password = $input['password'] ?? '';

if (!$name || !$email || !$password) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit;
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Check if email already exists
$stmt = $pdo->prepare("SELECT user_id FROM Users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Email already registered.']);
    exit;
}

// Insert user
$stmt = $pdo->prepare("
    INSERT INTO users (full_name, email, password_hash, created_at)
    VALUES (?, ?, ?, NOW())
");
$stmt->execute([$name, $email, $hashedPassword]);

// Return success
ob_end_clean();
echo json_encode([
    'success' => true,
    'message' => 'Account created successfully!',
    'redirect' => 'signin.html'
]);
exit;