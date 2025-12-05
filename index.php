<?php
// No session needed for this logic — but we'll keep it in case you want to use it later
session_start();

// Database configuration
$host = 'localhost';
$dbname = 'spending_tracker';
$username = 'root';
$password = '';

$message_sent = false;
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['name'])) {
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $message = trim($_POST['message']);

    // Validation
    if (empty($name) || empty($email) || empty($message)) {
        $error = "All fields are required.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Please enter a valid email address.";
    } else {
        try {
            $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // 🔍 Step 1: Look up email in the users table
            $user_id = null; // default
            $stmt_lookup = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
            $stmt_lookup->execute([$email]);
            $user = $stmt_lookup->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                $user_id = (int)$user['user_id'];
            }

            // 🔍 Step 2: Insert into contactus
            $stmt_insert = $pdo->prepare("INSERT INTO contactus (user_id, name, email, message) VALUES (?, ?, ?, ?)");
            $stmt_insert->execute([$user_id, $name, $email, $message]);

            $message_sent = true;
        } catch (PDOException $e) {
            $error = "Failed to send message. Please try again later.";
            // Optional: error_log($e->getMessage());
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome | Spending App</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="index.css">
</head>
<body>
  <!-- Navbar -->
  <nav class="navbar">
    <div class="logo" onclick="document.getElementById('home').scrollIntoView({behavior:'smooth'})">Spending Tracker</div>
    <div class="nav-links">
      <a href="#home">Home</a>
      <a href="#about">About</a>
      <a href="#features">Features</a>
      <a href="#contact">Contact</a>
    </div>
    <button class="theme-toggle" id="theme-toggle">🌓</button>
  </nav>

  <!-- Home Section -->
  <section id="home" class="hero">
    <h2>Take Control of Your Money</h2>
    <p>Track every peso, set daily limits, and visualize your spending habits—all in one beautiful app designed for students like you.</p>
    <div class="hero-buttons">
      <button class="btn btn-signin" onclick="window.location.href='signin.html'">Sign In</button>
      <button class="btn btn-signup" onclick="window.location.href='signup.html'">Create Account</button>
    </div>
  </section>

  <!-- About Section -->
  <section id="about">
    <h2>About Spending Tracker</h2>
    <p>
      Spending Tracker is a lightweight, privacy-focused expense manager built by a group of BSIT students from 
      <strong>Cebu Technological University – Argao Campus</strong>.
    </p>
    <p>
      No ads. No cloud tracking. Your data stays on your device.
    </p>
  </section>

  <!-- Features Section -->
  <section id="features">
    <h2>Key Features</h2>
    <div class="features-grid">
      <div class="feature-card">
        <h3>📊 Real-Time Tracking</h3>
        <p>Log expenses instantly and see your total update in real time.</p>
      </div>
      <div class="feature-card">
        <h3>🎯 Daily Limits</h3>
        <p>Set a daily spending cap and get visual alerts when you’re close to exceeding it.</p>
      </div>
      <div class="feature-card">
        <h3>📈 Visual Analytics</h3>
        <p>Pie charts and bar graphs show where your money goes—by category and date.</p>
      </div>
      <div class="feature-card">
        <h3>🔒 Local Storage</h3>
        <p>All your data is saved securely in your browser.</p>
      </div>
    </div>
  </section>

  <!-- Contact Section -->
  <section id="contact">
    <h2>Get in Touch</h2>
    <p style="font-size: 20px;">Hi, how can we help you?</p>
    <div class="robot-avatar">🤖</div>

    <?php if ($message_sent): ?>
      <div class="modal" id="success-modal" style="display: flex;">
        <div class="modal-content">
          <h3>Message Sent!</h3>
          <p>Thank you, <?php echo htmlspecialchars($_POST['name'] ?? 'there'); ?>! We’ll get back to you soon.</p>
          <button class="btn" onclick="document.getElementById('success-modal').style.display='none'; document.getElementById('contact-form')?.reset();">Close</button>
        </div>
      </div>
    <?php elseif ($error): ?>
      <div style="background:#ff6b6b; color:white; padding:12px; border-radius:10px; margin-bottom:20px; max-width:700px; text-align:center;">
        <?php echo htmlspecialchars($error); ?>
      </div>
    <?php endif; ?>

    <form class="contact-form" method="POST" id="contact-form">
      <div class="form-row">
        <input type="text" name="name" id="name" placeholder="Name" required 
               value="<?php echo isset($_POST['name']) ? htmlspecialchars($_POST['name']) : ''; ?>">
        <input type="email" name="email" id="email" placeholder="Email" required 
               value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>">
      </div>
      <textarea name="message" id="message" placeholder="Message" required><?php echo isset($_POST['message']) ? htmlspecialchars($_POST['message']) : ''; ?></textarea>
      <button type="submit" class="btn">Send Message</button>
    </form>

    <p class="contact-note">
      We’ll respond within 24–48 hours. For urgent issues, email directly: <strong>kagurahimme@gmail.com</strong>
    </p>
  </section>

  <!-- Success Modal (fallback) -->
  <div class="modal" id="success-modal" style="display:none;">
    <div class="modal-content">
      <h3>Message Sent!</h3>
      <p id="modal-message">Thank you! We’ll get back to you soon.</p>
      <button class="btn" id="close-modal">Close</button>
    </div>
  </div>

  <script src="index.js"></script>
  <script>
    document.getElementById('close-modal')?.addEventListener('click', () => {
      document.getElementById('success-modal').style.display = 'none';
      document.getElementById('contact-form')?.reset();
    });
    window.onclick = function(event) {
      const modal = document.getElementById('success-modal');
      if (event.target === modal) {
        modal.style.display = 'none';
        document.getElementById('contact-form')?.reset();
      }
    };
  </script>
</body>
</html>