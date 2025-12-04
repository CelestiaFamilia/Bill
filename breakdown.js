const categories = [
  { key: 'Food', label: 'Food', color: '#18C80E' },
  { key: 'Groceries', label: 'Groceries', color: '#F07DF2' },
  { key: 'Transportation', label: 'Transportation', color: '#CB4040' },
  { key: 'Load/Subscription', label: 'Load/Subscription', color: '#F49415' }
];

// DOM Elements
const dateInput = document.getElementById('date-select');
const totalSpentEl = document.getElementById('total-spent');
const breakdownListEl = document.getElementById('breakdown-list');
const periodLabel = document.getElementById('period-label');
const periodButtons = document.querySelectorAll('.period-btn');
const chartCanvas = document.getElementById('spending-chart');
const chartContainer = chartCanvas.getContext('2d');

// Initialize
const now = new Date();
dateInput.valueAsDate = now;
let currentPeriod = 'daily';
let spendingChart = null;

// Apply saved theme
(function applyTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.className = document.body.className
    .replace(/\b(light-mode|dark-mode)\b/g, '')
    .trim();
  document.body.classList.add(savedTheme + '-mode');
})();

// Period button handlers
periodButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    periodButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentPeriod = btn.dataset.period;
    updatePeriodLabel();
    loadSpendingData();
  });
});

// Update period label text
function updatePeriodLabel() {
  const labels = {
    daily: 'Today',
    weekly: 'This Week',
    monthly: 'This Month',
    yearly: 'This Year'
  };
  periodLabel.textContent = labels[currentPeriod];
}

// Load spending data from server
async function loadSpendingData() {
  const selectedDate = dateInput.value || new Date().toISOString().split('T')[0];

  try {
    const url = `fetch-breakdown-data.php?period=${encodeURIComponent(currentPeriod)}&date=${encodeURIComponent(selectedDate)}`;
    const response = await fetch(url);
    const result = await response.json();

    console.log('✅ Server Response:', result);

    if (result.success) {
      totalSpentEl.textContent = result.total.toFixed(2);
      renderBreakdown(result.categoryTotals);
      renderChart(result.categoryTotals);
    } else {
      showError(result.error || 'Failed to load data.');
    }
  } catch (err) {
    console.error('Fetch error:', err);
    showError('Could not connect to server.');
  }
}

// Render category breakdown list — ALWAYS show all categories
function renderBreakdown(categoryTotals) {
  breakdownListEl.innerHTML = '';

  categories.forEach(cat => {
    const value = categoryTotals[cat.key] || 0;
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `
      <div class="item-name">
        <div class="color-dot" style="background:${cat.color}"></div>
        ${cat.label}
      </div>
      <div>₱${value.toFixed(2)}</div>
    `;
    breakdownListEl.appendChild(item);
  });
}

// Render spending chart — with safety checks
function renderChart(categoryTotals) {
  // Destroy existing chart
  if (spendingChart) {
    spendingChart.destroy();
  }

  // ✅ Critical: Reset canvas to clear any residual rendering
  const ctx = chartCanvas.getContext('2d');
  ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

  // Prepare chart data
  const labels = categories.map(cat => cat.label);
  const data = categories.map(cat => categoryTotals[cat.key] || 0);
  const backgroundColors = categories.map(cat => cat.color);

  console.log('📈 Chart Data Prepared:', { labels, data });

  // Safety check: Ensure Chart.js is loaded
  if (typeof Chart === 'undefined') {
    console.error('❌ Chart.js not loaded! Check your CDN URL.');
    return;
  }

  // Create new chart
  spendingChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Spending Amount (₱)',
        data: data,
        backgroundColor: backgroundColors,
        borderWidth: 0,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          padding: 12,
          backgroundColor: 'rgba(0,0,0,0.7)',
          titleFont: { size: 14 },
          bodyFont: { size: 14 },
          callbacks: {
            label: (context) => `₱${context.parsed.y.toFixed(2)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255,255,255,0.1)'
          },
          ticks: {
            color: 'rgba(255,255,255,0.7)',
            callback: (value) => '₱' + value
          }
        },
        x: {
          grid: { display: false },
          ticks: {
            color: 'rgba(255,255,255,0.9)'
          }
        }
      }
    }
  });
}

// Show error message
function showError(message) {
  breakdownListEl.innerHTML = `<div style="text-align:center; padding:20px; color:#ff6b6b;">${message}</div>`;
}

// Event listeners
dateInput.addEventListener('change', loadSpendingData);

// Initialize
updatePeriodLabel();
loadSpendingData();