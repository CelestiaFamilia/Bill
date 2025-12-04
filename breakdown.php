<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: signin.html');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="timezone" content="Asia/Manila">
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Spending Breakdown</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="breakdown.css">
</head>
<body>
  <div class="container">
    <div class="header">Spending Breakdown</div>

    <div class="date-picker">
      <label for="date-select">View Date:</label>
      <input type="date" id="date-select" />
      <div class="period-selector">
        <button class="period-btn active" data-period="daily">Daily</button>
        <button class="period-btn" data-period="weekly">Weekly</button>
        <button class="period-btn" data-period="monthly">Monthly</button>
        <button class="period-btn" data-period="yearly">Yearly</button>
      </div>
    </div>

    <div class="summary">
      <div class="total-label">Total Spent <span id="period-label">Today</span></div>
      <div class="total-value">₱<span id="total-spent">0</span></div>
    </div>

    <div class="chart-container">
      <canvas id="spending-chart"></canvas>
    </div>

    <div class="breakdown-list" id="breakdown-list">
      <!-- Items loaded by JS -->
    </div>

    <a href="Homepage.php" class="back-link">← Back to Dashboard</a>
  </div>

  <!-- ✅ FIXED: Removed extra spaces -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="breakdown.js"></script>
</body>
</html>