// Set today as default
document.getElementById('date').valueAsDate = new Date();

// Get modal elements
const successModal = document.getElementById('success-modal');
const closeSuccessModalBtn = document.getElementById('close-success-modal');

// Show success modal
function showSuccessModal() {
  successModal.style.display = 'flex';
}

// Close success modal
function closeSuccessModal() {
  successModal.style.display = 'none';
}

// Attach close button event
if (closeSuccessModalBtn) {
  closeSuccessModalBtn.addEventListener('click', closeSuccessModal);
}

// Close if clicking outside
if (successModal) {
  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
      closeSuccessModal();
    }
  });
}

// Helper: Show error under a field
function showError(fieldId, message) {
  const errorEl = document.getElementById(`${fieldId}-error`);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
}

// Helper: Hide all errors
function hideAllErrors() {
  const errorEls = document.querySelectorAll('.error-msg');
  errorEls.forEach(el => el.style.display = 'none');
}

// Save button logic
document.getElementById('save-btn').addEventListener('click', () => {
  // Clear previous errors
  hideAllErrors();

  const date = document.getElementById('date').value;
  const amountStr = document.getElementById('amount').value.trim();
  const amount = parseFloat(amountStr);
  const category = document.getElementById('category').value;

  let hasError = false;

  // Validate date
  if (!date) {
    showError('date', 'Please select a date.');
    hasError = true;
  }

  // Validate amount
  if (!amountStr) {
    showError('amount', 'Please enter an amount.');
    hasError = true;
  } else if (isNaN(amount) || amount <= 0) {
    showError('amount', 'Amount must be a positive number.');
    hasError = true;
  }

  // Validate category
  if (!category) {
    showError('category', 'Please select a category.');
    hasError = true;
  }

  if (hasError) return;

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

  // Show success modal
  showSuccessModal();

  // Optional: Clear form after success
  // document.getElementById('amount').value = '';
  // document.getElementById('category').value = '';
});

// Theme application
(function applyTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.className = document.body.className
    .replace(/\b(light-mode|dark-mode)\b/g, '')
    .trim();
  document.body.classList.add(savedTheme + '-mode');
})();