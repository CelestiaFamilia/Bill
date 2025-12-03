<?php
// Set content type to JSON for AJAX responses
header('Content-Type: application/json');

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database configuration - Update these with your actual credentials
$host = 'localhost'; // or 'localhost'
$dbname = 'spending_tracker';
$username = 'root';   // Update this with your actual username
$password = '';       // Update this with your actual password

try {
    // Create PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if request method is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid request method. Please use POST.'
        ]);
        exit;
    }
    
    // Get email and password from POST data
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    // Debug: Log what we received
    error_log("DEBUG: Received email: " . $email);
    error_log("DEBUG: Password length: " . strlen($password));
    
    // Validate input
    if (empty($email) || empty($password)) {
        echo json_encode([
            'success' => false,
            'message' => 'Please enter both email and password.'
        ]);
        exit;
    }
    
    // Prepare SQL statement to prevent SQL injection
    $stmt = $pdo->prepare("SELECT user_id, full_name, email, password_hash FROM users WHERE email = :email");
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->execute();
    
    // Fetch user data
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Debug: Log if user was found
    if ($user) {
        error_log("DEBUG: User found: " . print_r($user, true));
    } else {
        error_log("DEBUG: User NOT found for email: " . $email);
    }
    
    // Check if user exists
    if (!$user) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email or password.'
        ]);
        exit;
    }
    
    // Verify password using password_verify
    if (!password_verify($password, $user['password_hash'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email or password.'
        ]);
        exit;
    }
    
    // Password is correct, create session
    session_start();
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['full_name'] = $user['full_name'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['logged_in'] = true;
    $_SESSION['last_activity'] = time();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Welcome back, ' . htmlspecialchars($user['full_name']) . '!',
        'redirect' => 'Homepage.php' // Change this to your actual dashboard page
    ]);
    
} catch (PDOException $e) {
    // Log error for debugging
    error_log("Database Error: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed. Check server logs.'
    ]);
} catch (Exception $e) {
    // General exception handler
    error_log("General Error: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'An unexpected error occurred. Please try again later.'
    ]);
}
?>