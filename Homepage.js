// DOM elements
const profileBtn = document.getElementById('profile-btn');
const profileModal = document.getElementById('profile-modal');
const closeProfileModal = document.getElementById('close-profile-modal');
const saveProfileBtn = document.getElementById('save-profile');
const profileNameEl = document.getElementById('profile-name');
const dailyLimitInPie = document.getElementById('daily-limit-in-pie');
const dailyLimitModal = document.getElementById('daily-limit-modal');
const closeDailyLimitModal = document.getElementById('close-daily-limit-modal');
const updateDailyLimitBtn = document.getElementById('update-daily-limit');
const dailyLimitInput = document.getElementById('daily-limit-input');
const dailyLimitValueEl = document.getElementById('daily-limit-value');
const addBtn = document.getElementById('add-spending-btn');
const addModal = document.getElementById('add-modal');
const closeAddModal = document.getElementById('close-add-modal');
const saveBtn = document.getElementById('save-spending');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const totalSpentEl = document.getElementById('total-spent');
const todayTotalEl = document.getElementById('today-total');
const pieChartCanvas = document.getElementById('pie-chart');
const barsContainer = document.getElementById('bars-container');
const datePicker = document.getElementById('date-picker');
const breakdownList = document.getElementById('breakdown-list');
const sidebarAvatar = document.getElementById('sidebar-avatar');
const profilePreview = document.getElementById('profile-preview');
const previewPlaceholder = document.getElementById('preview-placeholder');
const imageUploadBtn = document.getElementById('image-upload-btn');
const profileImageInput = document.getElementById('profile-image-input');

// ===== NEW: Delete Confirmation Modal Elements =====
const deleteConfirmModal = document.getElementById('delete-confirm-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const deleteCategoryLabel = document.getElementById('delete-category-label');

// ===== Server-based data model =====
let userData = null;
let spendingData = null;
let currentDate = null;
let categoryToDelete = null; // Track which category is being deleted

const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const categories = [
  { id: 1, key: 'Food', label: 'Food', color: '#18C80E' },
  { id: 2, key: 'Groceries', label: 'Groceries', color: '#F07DF2' },
  { id: 3, key: 'Transportation', label: 'Transportation', color: '#CB4040' },
  { id: 4, key: 'Load/Subscription', label: 'Load/Subscription', color: '#F49415' }
];

// Initialize profile image
function initProfileImage() {
  if (userData.profileImage) {
    sidebarAvatar.style.background = `url('${userData.profileImage}') center/cover no-repeat`;
    profilePreview.innerHTML = `<img src="${userData.profileImage}" alt="Profile">`;
    previewPlaceholder.style.display = 'none';
  } else {
    const firstLetter = userData.name.charAt(0).toUpperCase();
    previewPlaceholder.textContent = firstLetter;
    sidebarAvatar.style.background = `url('https://via.placeholder.com/60/FF69B4/ffffff?text=  ${firstLetter}') center/cover no-repeat`;
  }
}

// Initialize UI from server data
function initUI() {
  profileNameEl.textContent = userData.name;
  dailyLimitValueEl.textContent = userData.dailyLimit.toFixed(0);
  document.getElementById('limit-value-display').textContent = userData.dailyLimit.toFixed(0);
  updateSpendingDisplay();
  drawPieChart();
  drawBarGraph();
  renderBreakdownList();
  initProfileImage();
}

// Handle profile image upload
imageUploadBtn.addEventListener('click', () => {
  profileImageInput.click();
});

profileImageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target.result;
      userData.profileImage = imageUrl;
      profilePreview.innerHTML = `<img src="${imageUrl}" alt="Profile">`;
      previewPlaceholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
});

// ✅ UPDATED: Render breakdown list with delete capability
function renderBreakdownList() {
  breakdownList.innerHTML = '';
  
  categories.forEach(cat => {
    const value = spendingData.byCategory[cat.key]?.amount || 0;
    const percentage = spendingData.total > 0 ? ((value / spendingData.total) * 100).toFixed(1) : 0;
    const item = document.createElement('div');
    item.className = 'breakdown-item';
    item.innerHTML = `
      <div class="color-dot" style="background: ${cat.color};"></div>
      <div>${cat.label} - ₱<span>${value.toFixed(0)}</span> (${percentage}%)</div>
      <button class="remove-btn" data-category="${cat.key}" ${value <= 0 ? 'disabled' : ''}>✕</button>
    `;
    breakdownList.appendChild(item);

    // Attach delete listener only if there's spending
    if (value > 0) {
      const removeBtn = item.querySelector('.remove-btn');
      removeBtn.addEventListener('click', () => openDeleteConfirm(cat));
    }
  });
}

// ✅ NEW: Open delete confirmation modal
function openDeleteConfirm(category) {
  categoryToDelete = category;
  deleteCategoryLabel.textContent = category.label;
  deleteConfirmModal.classList.remove('hidden');
}

// Close profile modal
profileBtn.addEventListener('click', () => {
  document.getElementById('profile-name-input').value = userData.name || '';
  document.getElementById('profile-gender-input').value = userData.gender || '';
  document.getElementById('profile-birthday-input').value = userData.birthday || '';
  document.getElementById('profile-phone-input').value = userData.phone || '';
  document.getElementById('profile-email-input').value = userData.email || '';
  document.getElementById('profile-address-input').value = userData.address || '';
  
  initProfileImage();
  profileModal.style.display = 'flex';
});

closeProfileModal.addEventListener('click', () => {
  profileModal.style.display = 'none';
});

// Save profile
saveProfileBtn.addEventListener('click', async () => {
  const name = document.getElementById('profile-name-input').value.trim();
  const gender = document.getElementById('profile-gender-input').value.trim();
  const birthday = document.getElementById('profile-birthday-input').value.trim();
  const phone = document.getElementById('profile-phone-input').value.trim();
  const email = document.getElementById('profile-email-input').value.trim();
  const address = document.getElementById('profile-address-input').value.trim();

  if (!name) {
    showMessageModal('Error', 'Name is required.');
    return;
  }

  try {
    const response = await fetch('update-profile.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, gender, birthday, phone, email, address })
    });

    const result = await response.json();

    if (result.success) {
      userData.name = name;
      userData.gender = gender;
      userData.birthday = birthday;
      userData.phone = phone;
      userData.email = email;
      userData.address = address;

      profileNameEl.textContent = userData.name;
      initProfileImage();
      profileModal.style.display = 'none';

      const successModal = document.getElementById('success-modal');
      if (successModal) {
        successModal.querySelector('.success-title').textContent = 'Profile Saved!';
        successModal.querySelector('.success-message').textContent = 'Your changes have been saved successfully.';
        successModal.style.display = 'flex';
        setTimeout(() => successModal.style.display = 'none', 2000);
      }
    } else {
      showMessageModal('Error', result.message || 'Failed to update profile.');
    }
  } catch (err) {
    console.error('Profile update error:', err);
    showMessageModal('Error', 'Could not connect to server.');
  }
});

// Show daily limit modal
dailyLimitInPie.addEventListener('click', () => {
  dailyLimitInput.value = userData.dailyLimit;
  dailyLimitModal.style.display = 'flex';
});

closeDailyLimitModal.addEventListener('click', () => {
  dailyLimitModal.style.display = 'none';
});

// Update daily limit
updateDailyLimitBtn.addEventListener('click', async () => {
  const newLimit = parseFloat(dailyLimitInput.value);
  if (isNaN(newLimit) || newLimit < 0) {
    showMessageModal('Error', 'Please enter a valid daily limit.');
    return;
  }

  try {
    const response = await fetch('update-daily-limit.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ daily_limit: newLimit })
    });

    const result = await response.json();

    if (result.success) {
      userData.dailyLimit = newLimit;
      dailyLimitValueEl.textContent = newLimit.toFixed(0);
      document.getElementById('limit-value-display').textContent = newLimit.toFixed(0);
      updateSpendingDisplay();
      dailyLimitModal.style.display = 'none';

      const successModal = document.getElementById('success-modal');
      if (successModal) {
        successModal.querySelector('.success-title').textContent = 'Daily Limit Updated!';
        successModal.querySelector('.success-message').textContent = `Your new limit is ₱${newLimit.toFixed(0)}.`;
        successModal.style.display = 'flex';
        setTimeout(() => successModal.style.display = 'none', 2000);
      }
    } else {
      showMessageModal('Error', result.message || 'Failed to update daily limit.');
    }
  } catch (err) {
    console.error('Daily limit update error:', err);
    showMessageModal('Error', 'Could not connect to server.');
  }
});

// Show add spending modal
addBtn.addEventListener('click', () => {
  amountInput.value = '';
  categorySelect.value = '';
  addModal.style.display = 'flex';
});

closeAddModal.addEventListener('click', () => {
  addModal.style.display = 'none';
});

// Save spending
saveBtn.addEventListener('click', async () => {
  const amount = parseFloat(amountInput.value);
  const categoryKey = categorySelect.value;

  if (isNaN(amount) || amount <= 0 || !categoryKey) {
    showMessageModal('Error', 'Please enter a valid amount and select a category.');
    return;
  }

  const selectedCategory = categories.find(cat => cat.key === categoryKey);
  if (!selectedCategory) {
    showMessageModal('Error', 'Invalid category selected.');
    return;
  }

  try {
    const response = await fetch('save-spending.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        amount, 
        category_id: selectedCategory.id,
        spending_date: currentDate 
      })
    });

    const result = await response.json();
    
    if (result.success) {
      await fetchUserData(currentDate);
      addModal.style.display = 'none';
    } else {
      showMessageModal('Error', result.message || 'Failed to save spending.');
    }
  } catch (err) {
    console.error('Save error:', err);
    showMessageModal('Error', 'Could not connect to server.');
  }
});

// Update spending display (limit warning, totals)
function updateSpendingDisplay() {
  const total = spendingData.total;
  const limit = userData.dailyLimit;

  totalSpentEl.textContent = total.toFixed(0);
  todayTotalEl.textContent = total.toFixed(0);

  const todayValueEl = document.getElementById('today-total');
  if (total > limit) {
    todayValueEl.classList.add('warning-red');
    showLimitExceededWarning();
  } else {
    todayValueEl.classList.remove('warning-red');
    hideLimitExceededWarning();
  }
}

// Draw pie chart
function drawPieChart() {
  const ctx = pieChartCanvas.getContext('2d');
  const width = pieChartCanvas.width;
  const height = pieChartCanvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 10;

  ctx.clearRect(0, 0, width, height);

  const values = categories.map(cat => spendingData.byCategory[cat.key]?.amount || 0);
  const total = values.reduce((a, b) => a + b, 0);

  let startAngle = 0;
  for (let i = 0; i < categories.length; i++) {
    const value = values[i];
    const percentage = total > 0 ? value / total : 0;
    const endAngle = startAngle + percentage * 2 * Math.PI;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = categories[i].color;
    ctx.fill();

    const slicePercentage = total > 0 ? (value / total) * 100 : 0;
    if (slicePercentage > 5) {
      const midAngle = startAngle + (endAngle - startAngle) / 2;
      const textRadius = radius * 0.7;
      const textX = centerX + Math.cos(midAngle) * textRadius;
      const textY = centerY + Math.sin(midAngle) * textRadius;
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Poppins';
      ctx.textAlign = 'center';
      ctx.fillText(`${slicePercentage.toFixed(1)}%`, textX, textY);
    }

    startAngle = endAngle;
  }

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fill();

  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px Poppins';
  ctx.textAlign = 'center';
  ctx.fillText(`₱${total.toFixed(0)}`, centerX, centerY + 8);
}

// Draw bar graph
function drawBarGraph() {
  barsContainer.innerHTML = '';

  const values = categories.map(cat => spendingData.byCategory[cat.key]?.amount || 0);
  const maxValue = Math.max(...values, 1);
  const total = spendingData.total;

  categories.forEach(cat => {
    const value = spendingData.byCategory[cat.key]?.amount || 0;
    const percentageOfMax = (value / maxValue) * 100;
    const height = Math.max(10, (percentageOfMax * 70) / 100);

    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${height}px`;
    bar.style.backgroundColor = cat.color;

    const percentageLabel = document.createElement('div');
    percentageLabel.className = 'bar-percentage';
    const barPercentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    percentageLabel.textContent = `${barPercentage}%`;

    const label = document.createElement('div');
    label.className = 'bar-label';
    label.textContent = cat.label;

    bar.appendChild(percentageLabel);
    bar.appendChild(label);
    barsContainer.appendChild(bar);
  });
}

// Handle date picker change
datePicker.addEventListener('change', () => {
  currentDate = datePicker.value;
  fetchUserData(currentDate);
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === profileModal) profileModal.style.display = 'none';
  if (e.target === addModal) addModal.style.display = 'none';
  if (e.target === dailyLimitModal) dailyLimitModal.style.display = 'none';
  if (e.target === deleteConfirmModal) {
    deleteConfirmModal.classList.add('hidden');
    categoryToDelete = null;
  }
  if (e.target === logoutModal) logoutModal.style.display = 'none';
  if (e.target === limitWarningModal) limitWarningModal.style.display = 'none';
  const successModal = document.getElementById('success-modal');
  if (successModal && e.target === successModal) {
    successModal.style.display = 'none';
  }
});

// Apply saved theme
(function applyTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.className = document.body.className
    .replace(/\b(light-mode|dark-mode)\b/g, '')
    .trim();
  document.body.classList.add(savedTheme + '-mode');
})();

// ===== LOGOUT HANDLING =====
const logoutBtn = document.getElementById('logout-btn');
const logoutModal = document.getElementById('logout-modal');
const confirmLogoutBtn = document.getElementById('confirm-logout');
const cancelLogoutBtn = document.getElementById('cancel-logout');

logoutBtn.addEventListener('click', () => {
  logoutModal.style.display = 'flex';
});

cancelLogoutBtn.addEventListener('click', () => {
  logoutModal.style.display = 'none';
});

confirmLogoutBtn.addEventListener('click', () => {
  logoutModal.style.display = 'none';
  window.location.href = 'signin.html';
});

// ===== LIMIT WARNING MODAL =====
const limitWarningModal = document.getElementById('limit-warning-modal');
const closeWarningModalBtn = document.getElementById('close-warning-modal');
const excessAmountEl = document.getElementById('excess-amount');
const limitValueDisplayEl = document.getElementById('limit-value-display');

function showLimitExceededWarning() {
  const excess = spendingData.total - userData.dailyLimit;
  excessAmountEl.textContent = excess.toFixed(0);
  limitValueDisplayEl.textContent = userData.dailyLimit.toFixed(0);
  limitWarningModal.style.display = 'flex';
}

function hideLimitExceededWarning() {
  limitWarningModal.style.display = 'none';
}

closeWarningModalBtn?.addEventListener('click', () => {
  hideLimitExceededWarning();
});

// ===== MESSAGE MODAL (fallback) =====
function showMessageModal(title, message) {
  const modal = document.getElementById('message-modal');
  if (!modal) {
    alert(`${title}: ${message}`);
    return;
  }
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-text').textContent = message;
  modal.classList.add('show');
}

const modalClose = document.getElementById('modal-close');
if (modalClose) {
  modalClose.addEventListener('click', () => {
    const modal = document.getElementById('message-modal');
    if (modal) modal.classList.remove('show');
  });
}

// ✅ NEW: Handle delete confirmation
cancelDeleteBtn?.addEventListener('click', () => {
  deleteConfirmModal.classList.add('hidden');
  categoryToDelete = null;
});

confirmDeleteBtn?.addEventListener('click', async () => {
  if (!categoryToDelete) return;

  try {
    const response = await fetch('delete-spending.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category_id: categoryToDelete.id,
        spending_date: currentDate
      })
    });

    const result = await response.json();

    if (result.success) {
      await fetchUserData(currentDate); // Refresh UI
      deleteConfirmModal.classList.add('hidden');
      categoryToDelete = null;

      const successModal = document.getElementById('success-modal');
      if (successModal) {
        successModal.querySelector('.success-title').textContent = 'Spending Removed!';
        successModal.querySelector('.success-message').textContent = `All spending for "${categoryToDelete?.label}" has been deleted.`;
        successModal.style.display = 'flex';
        setTimeout(() => successModal.style.display = 'none', 2000);
      }
    } else {
      showMessageModal('Error', result.message || 'Failed to delete spending.');
    }
  } catch (err) {
    console.error('Delete error:', err);
    showMessageModal('Error', 'Could not connect to server.');
  }
});

// ===== FETCH USER DATA FROM SERVER =====
async function fetchUserData(date) {
  try {
    const res = await fetch(`fetch-user-data.php?date=${encodeURIComponent(date)}`);
    const data = await res.json();
    
    if (!data.success) {
      showMessageModal('Error', data.error || 'Failed to load data.');
      return false;
    }

    userData = data.user;
    spendingData = data.spending;
    currentDate = date;
    datePicker.value = date;
    initUI();
    return true;
  } catch (err) {
    console.error('Fetch error:', err);
    showMessageModal('Network Error', 'Could not load your data.');
    return false;
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  currentDate = getCurrentDate();
  datePicker.value = currentDate;
  fetchUserData(currentDate);
});