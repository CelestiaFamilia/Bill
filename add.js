// Set today as default
document.getElementById('date').valueAsDate = new Date();

document.getElementById('save-btn').addEventListener('click', () => {
  const date = document.getElementById('date').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;

  if (!date || isNaN(amount) || amount <= 0 || !category) {
    alert('Please fill all fields correctly.');
    return;
  }

  // Load existing data
  let spendingData = JSON.parse(localStorage.getItem('spendingDataV2')) || {};

  if (!spendingData[date]) {
    spendingData[date] = {
      food: 0,
      groceries: 0,
      transport: 0,
      load: 0,
      total: 0,
      dailyLimit: 200
    };
  }

  spendingData[date][category] += amount;
  spendingData[date].total += amount;

  localStorage.setItem('spendingDataV2', JSON.stringify(spendingData));

  alert('Spending added successfully!');
  window.location.href = 'index.html';
});
(function applyTheme() {
const savedTheme = localStorage.getItem('theme') || 'dark';
document.body.className = document.body.className
  .replace(/\b(light-mode|dark-mode)\b/g, '')
  .trim();
document.body.classList.add(savedTheme + '-mode');
})();   