const categories = [
    { key: 'food', label: 'Food', color: '#18C80E' },
    { key: 'groceries', label: 'Groceries', color: '#F07DF2' },
    { key: 'transport', label: 'Transportation', color: '#CB4040' },
    { key: 'load', label: 'Load/Subscription', color: '#F49415' }
  ];

  const dateInput = document.getElementById('date-select');
  const totalSpentEl = document.getElementById('total-spent');
  const breakdownListEl = document.getElementById('breakdown-list');

  // Set today
  const now = new Date();
  dateInput.valueAsDate = now;

  function loadSpendingForDate(dateStr) {
    const spendingData = JSON.parse(localStorage.getItem('spendingDataV2')) || {};
    const data = spendingData[dateStr] || {
      food: 0, groceries: 0, transport: 0, load: 0, total: 0
    };

    totalSpentEl.textContent = data.total.toFixed(2);

    breakdownListEl.innerHTML = '';
    categories.forEach(cat => {
      const value = data[cat.key] || 0;
      if (value > 0) {
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

    if (breakdownListEl.children.length === 0) {
      breakdownListEl.innerHTML = '<div style="text-align:center; padding:20px; opacity:0.8;">No spending recorded.</div>';
    }
  }

  dateInput.addEventListener('change', (e) => {
    loadSpendingForDate(e.target.value);
  });

  // Load initial data
  loadSpendingForDate(dateInput.value);
  (function applyTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.className = document.body.className
    .replace(/\b(light-mode|dark-mode)\b/g, '')
    .trim();
  document.body.classList.add(savedTheme + '-mode');
})();