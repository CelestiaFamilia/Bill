<?php
session_start();

// ---------- Configuration ----------
$host = 'localhost';
$dbUser = 'root';
$dbPass = '';
$database = 'final_project';
$dsn = "mysql:host=$host;dbname=$database;charset=utf8mb4";

// ---------- Database connection ----------
try {
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    // In production: log $e->getMessage() instead of echoing it.
    die('Database connection failed');
}

// ---------- CORS preflight handler (optional) ----------
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
    exit;
}

// ---------- CSRF token generation ----------
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
$csrf_token = $_SESSION['csrf_token'];

// ---------- Helpers ----------
function clean(string $v): string {
    return trim(htmlspecialchars($v, ENT_QUOTES));
}

$name = $emailOrPhone = '';
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validate CSRF token
    $postedToken = $_POST['csrf_token'] ?? '';
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $postedToken)) {
        $errors[] = 'Invalid CSRF token';
    }

    // Get form fields (we accept normal form submit)
    $name = clean($_POST['name'] ?? '');
    $emailOrPhone = clean($_POST['email_or_phone'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm = $_POST['confirm_password'] ?? '';

    // Basic server-side validation (authoritative)
    if (mb_strlen($name) < 2) $errors[] = 'Name must be at least 2 characters';
    if (mb_strlen($password) < 8) $errors[] = 'Password must be at least 8 characters';
    if ($password !== $confirm) $errors[] = 'Passwords do not match';

    // Email or phone detection
    $email = null;
    $phone = null;
    if (filter_var($emailOrPhone, FILTER_VALIDATE_EMAIL)) {
        $email = $emailOrPhone;
    } else {
        // Normalize phone: digits only, allow leading + (strip it)
        $phoneDigits = preg_replace('/\D+/', '', $emailOrPhone);
        if (strlen($phoneDigits) < 7) {
            $errors[] = 'Invalid phone number';
        } else {
            $phone = $phoneDigits;
        }
    }

    // Uniqueness checks
    if (empty($errors)) {
        try {
            if ($email) {
                $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
                $stmt->execute([$email]);
                if ($stmt->fetch()) $errors[] = 'Email already registered';
            } else {
                $stmt = $pdo->prepare('SELECT id FROM users WHERE phone = ? LIMIT 1');
                $stmt->execute([$phone]);
                if ($stmt->fetch()) $errors[] = 'Phone number already registered';
            }
        } catch (PDOException $e) {
            // Log in production
            $errors[] = 'Database error while checking uniqueness';
        }
    }

    // Insert user
    if (empty($errors)) {
        // USER REQUEST: include SHA-256 "encryption":
        // Best practice is to use password_hash(); here we first apply SHA-256 to the raw password
        // (this meets the "use sha 256" requirement) then we pass that pre-hash to password_hash()
        // so the stored value benefits from password_hash's adaptive algorithm.
        $preHash = hash('sha256', $password);          // sha256 hex string
        $finalHash = password_hash($preHash, PASSWORD_DEFAULT); // secure storage

        try {
            $stmt = $pdo->prepare('INSERT INTO users (user_name, email, phone, password_hash, created_at) VALUES (?, ?, ?, ?, NOW())');
            $stmt->execute([$name, $email, $phone, $finalHash]);

            // Regenerate session id and log-in user
            session_regenerate_id(true);
            $_SESSION['user_id'] = $pdo->lastInsertId();

            // Rotate CSRF token after sensitive action
            unset($_SESSION['csrf_token']);

            // Redirect to home/dashboard
            header('Location: home.html');
            exit;
        } catch (PDOException $e) {
            // If duplicate key constraint at DB level happened despite earlier check
            if (strpos($e->getMessage(), 'Duplicate') !== false) {
                $errors[] = 'Account already exists (duplicate)';
            } else {
                // Log $e->getMessage() in production
                $errors[] = 'Registration failed, please try again later';
            }
        }
    }
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Sign Up</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="signup.css" />
</head>
<body>
  <div class="card">
    <div class="header-row">
      <a href="signin.html" class="back-icon" title="Back">←</a>
      <div class="header">Create Account</div>
    </div>

    <div class="login-link">
      Already have an account? <a href="signin.html">Sign in</a>
    </div>

    <?php if (!empty($errors)): ?>
      <div class="errors" style="color:#b00020;margin:12px 0;">
        <ul>
          <?php foreach ($errors as $err): ?>
            <li><?php echo htmlspecialchars($err, ENT_QUOTES); ?></li>
          <?php endforeach; ?>
        </ul>
      </div>
    <?php endif; ?>

    <form id="user_inputs" action="signup.php" method="post" novalidate>
      <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($csrf_token, ENT_QUOTES); ?>">

      <div class="field">
        <label for="name">Name</label>
        <input type="text" id="name" name="name" placeholder="Your name" value="<?php echo htmlspecialchars($name ?? ''); ?>" required />
        <div class="error-message" id="name-error"></div>
      </div>

      <div class="field">
        <label for="email_or_phone">Email or Phone</label>
        <input type="text" id="email_or_phone" name="email_or_phone" placeholder="your@email.com or 0917..." value="<?php echo htmlspecialchars($emailOrPhone ?? ''); ?>" required />
        <div class="error-message" id="email-error"></div>
      </div>

      <div class="field">
        <label for="password">Password</label>
        <div class="password-wrapper">
          <input type="password" id="password" name="password" placeholder="At least 8 characters" required />
          <button type="button" class="toggle-password" id="toggle-password" aria-label="Toggle password visibility">👁️</button>
        </div>
        <div class="error-message" id="password-error"></div>
      </div>

      <div class="field">
        <label for="confirm_password">Confirm Password</label>
        <input type="password" id="confirm_password" name="confirm_password" placeholder="Repeat password" required />
        <div class="error-message" id="confirm-error"></div>
      </div>

      <div style="margin-top:12px;">
        <button type="submit" id="signup-btn">Sign Up</button>
      </div>
    </form>
  </div>

  <script src="signup.js"></script>
</body>
</html>
