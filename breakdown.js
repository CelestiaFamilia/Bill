const categories = [
  { key: 'food', label: 'Food', color: '#18C80E' },
  { key: 'groceries', label: 'Groceries', color: '#F07DF2' },
  { key: 'transport', label: 'Transportation', color: '#CB4040' },
  { key: 'load', label: 'Load/Subscription', color: '#F49415' }
];

// DOM Elements
const dateInput = document.getElementById('date-select');
const totalSpentEl = document.getElementById('total-spent');
const breakdownListEl = document.getElementById('breakdown-list');
const periodLabel = document.getElementById('period-label');
const periodButtons = document.querySelectorAll('.period-btn');
const chartContainer = document.getElementById('spending-chart').getContext('2d');

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

// Get date range based on period
function getDateRange(period, date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();
  
  switch(period) {
    case 'daily':
      return { start: formatDate(d), end: formatDate(d) };
    case 'weekly': {
      const day = d.getDay();
      const start = new Date(d);
      start.setDate(d.getDate() - day); // Start from Sunday
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { 
        start: formatDate(start), 
        end: formatDate(end),
        labels: Array.from({length: 7}, (_, i) => {
          const date = new Date(start);
          date.setDate(start.getDate() + i);
          return date.toLocaleDateString('en-US', { weekday: 'short' });
        })
      };
    }
    case 'monthly': {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      return { 
        start: formatDate(start), 
        end: formatDate(end),
        labels: Array.from({length: end.getDate()}, (_, i) => (i + 1).toString())
      };
    }
    case 'yearly': {
      return { 
        start: formatDate(new Date(year, 0, 1)), 
        end: formatDate(new Date(year, 11, 31)),
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      };
    }
    default:
      return { start: formatDate(d), end: formatDate(d) };
  }
}

// Format date as YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Load spending data based on current period and date
function loadSpendingData() {
  const selectedDate = dateInput.value || formatDate(now);
  const range = getDateRange(currentPeriod, selectedDate);
  
  const spendingData = JSON.parse(localStorage.getItem('spendingDataV2')) || {};
  let total = 0;
  const categoryTotals = { food: 0, groceries: 0, transport: 0, load: 0 };
  
  // Calculate totals for the period
  const datesInRange = getDatesInRange(range.start, range.end);
  datesInRange.forEach(date => {
    const data = spendingData[date] || {};
    categories.forEach(cat => {
      const value = data[cat.key] || 0;
      categoryTotals[cat.key] += value;
      total += value;
    });
  });
  
  // Update UI
  totalSpentEl.textContent = total.toFixed(2);
  renderBreakdown(categoryTotals);
  renderChart(categoryTotals, range);
}

// Get all dates between start and end (inclusive)
function getDatesInRange(start, end) {
  const dates = [];
  const currentDate = new Date(start);
  const endDate = new Date(end);
  
  while (currentDate <= endDate) {
    dates.push(formatDate(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

// Render category breakdown list
function renderBreakdown(categoryTotals) {
  breakdownListEl.innerHTML = '';
  let hasData = false;
  
  categories.forEach(cat => {
    const value = categoryTotals[cat.key] || 0;
    if (value > 0) {
      hasData = true;
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
    }
  });
  
  if (!hasData) {
    breakdownListEl.innerHTML = '<div style="text-align:center; padding:20px; opacity:0.8;">No spending recorded.</div>';
  }
}

// Render spending chart
function renderChart(categoryTotals, range) {
  // Destroy existing chart if it exists
  if (spendingChart) {
    spendingChart.destroy();
  }
  
  const labels = categories.map(cat => cat.label);
  const data = categories.map(cat => categoryTotals[cat.key] || 0);
  const backgroundColors = categories.map(cat => cat.color);
  
  spendingChart = new Chart(chartContainer, {
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

// Event listeners
dateInput.addEventListener('change', loadSpendingData);

// Initialize
updatePeriodLabel();
loadSpendingData();