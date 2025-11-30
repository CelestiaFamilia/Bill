// Initialize data from localStorage or defaults
let userData = JSON.parse(localStorage.getItem('userData')) || {
  name: 'kagura',
  gender: 'Female',
  birthday: 'May 8, 2005',
  phone: '09912398765',
  email: 'kagurahimme@gmail.com',
  address: 'Cyberion District',
  profileImage: null // Will store image data URL
};

// Get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Initialize spending data structure
let spendingData = JSON.parse(localStorage.getItem('spendingDataV2')) || {};
let currentDate = getCurrentDate();

// Initialize today's data if it doesn't exist
if (!spendingData[currentDate]) {
  spendingData[currentDate] = {
    food: 0,
    groceries: 0,
    transport: 0,
    load: 0,
    total: 0,
    dailyLimit: 200
  };
}

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

// Set today as default in date picker
datePicker.value = currentDate;

// Categories configuration
const categories = [
  { key: 'food', label: 'Food', color: '#18C80E' },
  { key: 'groceries', label: 'Groceries', color: '#F07DF2' },
  { key: 'transport', label: 'Transportation', color: '#CB4040' },
  { key: 'load', label: 'Load/Subscription', color: '#F49415' }
];

// Initialize profile image
function initProfileImage() {
  if (userData.profileImage) {
    sidebarAvatar.style.background = `url('${userData.profileImage}') center/cover no-repeat`;
    profilePreview.innerHTML = `<img src="${userData.profileImage}" alt="Profile">`;
    previewPlaceholder.style.display = 'none';
  } else {
    // Use first letter of name as placeholder
    const firstLetter = userData.name.charAt(0).toUpperCase();
    previewPlaceholder.textContent = firstLetter;
    sidebarAvatar.style.background = `url('https://via.placeholder.com/60/FF69B4/ffffff?text=${firstLetter}') center/cover no-repeat`;
  }
}

// Initialize UI
function initUI() {
  // Set profile name
  profileNameEl.textContent = userData.name;

  // Set daily limit
  dailyLimitValueEl.textContent = spendingData[currentDate].dailyLimit.toFixed(0);

  // Update spending display
  updateSpendingDisplay();

  // Draw charts
  drawPieChart();
  drawBarGraph();
  renderBreakdownList();
  
  // Initialize profile image
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

// Render breakdown list with remove buttons
function renderBreakdownList() {
  breakdownList.innerHTML = '';
  
  categories.forEach(cat => {
    const value = spendingData[currentDate][cat.key];
    const percentage = spendingData[currentDate].total > 0 ? ((value / spendingData[currentDate].total) * 100).toFixed(1) : 0;
    const item = document.createElement('div');
    item.className = 'breakdown-item';
    item.innerHTML = `
      <div class="color-dot" style="background: ${cat.color};"></div>
      <div>${cat.label} - ₱<span>${value.toFixed(0)}</span> (${percentage}%)</div>
      <button class="remove-btn" data-category="${cat.key}">✕</button>
    `;
    breakdownList.appendChild(item);
  });
  
  // Add event listeners to remove buttons
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const category = e.target.getAttribute('data-category');
      removeSpending(category);
    });
  });
}

// Remove spending for a category
function removeSpending(category) {
  if (spendingData[currentDate][category] > 0) {
    spendingData[currentDate][category] = 0;
    spendingData[currentDate].total = categories.reduce((sum, cat) => 
      sum + spendingData[currentDate][cat.key], 0);
    
    // Save to localStorage
    localStorage.setItem('spendingDataV2', JSON.stringify(spendingData));
    
    // Update UI
    updateSpendingDisplay();
    drawPieChart();
    drawBarGraph();
    renderBreakdownList();
  }
}

// Show profile modal
profileBtn.addEventListener('click', () => {
  document.getElementById('profile-name-input').value = userData.name;
  document.getElementById('profile-gender-input').value = userData.gender;
  document.getElementById('profile-birthday-input').value = userData.birthday;
  document.getElementById('profile-phone-input').value = userData.phone;
  document.getElementById('profile-email-input').value = userData.email;
  document.getElementById('profile-address-input').value = userData.address;
  
  // Re-initialize profile image in modal
  initProfileImage();
  
  profileModal.style.display = 'flex';
});

// Close profile modal
closeProfileModal.addEventListener('click', () => {
  profileModal.style.display = 'none';
});

// Save profile
saveProfileBtn.addEventListener('click', () => {
  userData.name = document.getElementById('profile-name-input').value.trim();
  userData.gender = document.getElementById('profile-gender-input').value.trim();
  userData.birthday = document.getElementById('profile-birthday-input').value.trim();
  userData.phone = document.getElementById('profile-phone-input').value.trim();
  userData.email = document.getElementById('profile-email-input').value.trim();
  userData.address = document.getElementById('profile-address-input').value.trim();

  // Save to localStorage
  localStorage.setItem('userData', JSON.stringify(userData));

  // Update UI
  profileNameEl.textContent = userData.name;
  initProfileImage();

  // Close modal
  profileModal.style.display = 'none';
});

// Show daily limit modal
dailyLimitInPie.addEventListener('click', () => {
  dailyLimitInput.value = spendingData[currentDate].dailyLimit;
  dailyLimitModal.style.display = 'flex';
});

// Close daily limit modal
closeDailyLimitModal.addEventListener('click', () => {
  dailyLimitModal.style.display = 'none';
});

// Update daily limit
updateDailyLimitBtn.addEventListener('click', () => {
  const newLimit = parseFloat(dailyLimitInput.value);
  if (isNaN(newLimit) || newLimit < 0) {
    alert('Please enter a valid daily limit.');
    return;
  }

  spendingData[currentDate].dailyLimit = newLimit;

  // Save to localStorage
  localStorage.setItem('spendingDataV2', JSON.stringify(spendingData));

  // Update UI
  dailyLimitValueEl.textContent = spendingData[currentDate].dailyLimit.toFixed(0);

  // Close modal
  dailyLimitModal.style.display = 'none';
});

// Show add spending modal
addBtn.addEventListener('click', () => {
  amountInput.value = '';
  categorySelect.value = '';
  addModal.style.display = 'flex';
});

// Close add spending modal
closeAddModal.addEventListener('click', () => {
  addModal.style.display = 'none';
});

// Save spending
saveBtn.addEventListener('click', () => {
  const amount = parseFloat(amountInput.value);
  const category = categorySelect.value;

  if (isNaN(amount) || amount <= 0 || !category) {
    alert('Please enter a valid amount and select a category.');
    return;
  }

  // Initialize date data if it doesn't exist
  if (!spendingData[currentDate]) {
    spendingData[currentDate] = {
      food: 0,
      groceries: 0,
      transport: 0,
      load: 0,
      total: 0,
      dailyLimit: 200
    };
  }

  // Update spending data
  spendingData[currentDate][category] += amount;
  spendingData[currentDate].total += amount;

  // Save to localStorage
  localStorage.setItem('spendingDataV2', JSON.stringify(spendingData));

  // Update UI
  updateSpendingDisplay();
  drawPieChart();
  drawBarGraph();
  renderBreakdownList();

  // Reset form
  amountInput.value = '';
  categorySelect.value = '';

  // Close modal
  addModal.style.display = 'none';
});

function updateSpendingDisplay() {
  const data = spendingData[currentDate];
  const total = data.total;
  const limit = data.dailyLimit;

  totalSpentEl.textContent = total.toFixed(0);
  todayTotalEl.textContent = total.toFixed(0);

  // Apply or remove red warning based on limit
  const todayValueEl = document.getElementById('today-total');
  if (total > limit) {
    todayValueEl.classList.add('warning-red');
    showLimitExceededWarning();
  } else {
    todayValueEl.classList.remove('warning-red');
    hideLimitExceededWarning();
  }
}

// Draw pie chart with percentages
function drawPieChart() {
  const ctx = pieChartCanvas.getContext('2d');
  const width = pieChartCanvas.width;
  const height = pieChartCanvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 10;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  const values = categories.map(cat => spendingData[currentDate][cat.key]);
  const total = values.reduce((a, b) => a + b, 0);

  // Draw pie slices with percentages
  let startAngle = 0;
  for (let i = 0; i < categories.length; i++) {
    const value = values[i];
    const percentage = total > 0 ? value / total : 0;
    const endAngle = startAngle + percentage * 2 * Math.PI;

    // Draw slice
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = categories[i].color;
    ctx.fill();

    // Calculate percentage for this slice
    const slicePercentage = total > 0 ? (value / total) * 100 : 0;
    
    // Draw percentage text on the slice
    if (slicePercentage > 5) { // Only show percentage if it's significant
      const midAngle = startAngle + (endAngle - startAngle) / 2;
      const textRadius = radius * 0.7; // Position text at 70% of radius
      const textX = centerX + Math.cos(midAngle) * textRadius;
      const textY = centerY + Math.sin(midAngle) * textRadius;
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Poppins';
      ctx.textAlign = 'center';
      ctx.fillText(`${slicePercentage.toFixed(1)}%`, textX, textY);
    }

    startAngle = endAngle;
  }

  // Draw center circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fill();

  // Draw total spent in center
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px Poppins';
  ctx.textAlign = 'center';
  ctx.fillText(`₱${spendingData[currentDate].total}`, centerX, centerY + 8);
}

// Draw bar graph with percentages
function drawBarGraph() {
  // Clear container
  barsContainer.innerHTML = '';
  
  // Find maximum value for scaling
  const maxValue = Math.max(...categories.map(cat => spendingData[currentDate][cat.key]), 1);
  
  // Create bars with percentages
  categories.forEach(cat => {
    const value = spendingData[currentDate][cat.key];
    const percentage = (value / maxValue) * 100;
    // Minimum height of 10px for visibility
    const height = Math.max(10, (percentage * 130) / 100);
    
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${height}px`;
    bar.style.backgroundColor = cat.color;
    
    // Add percentage label above the bar
    const percentageLabel = document.createElement('div');
    percentageLabel.className = 'bar-percentage';
    const barPercentage = spendingData[currentDate].total > 0 ? ((value / spendingData[currentDate].total) * 100).toFixed(1) : 0;
    percentageLabel.textContent = `${barPercentage}%`;
    
    // Add category label below the bar
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
  
  // Initialize data for this date if it doesn't exist
  if (!spendingData[currentDate]) {
    spendingData[currentDate] = {
      food: 0,
      groceries: 0,
      transport: 0,
      load: 0,
      total: 0,
      dailyLimit: 200
    };
  }
  
  initUI();
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === profileModal) {
    profileModal.style.display = 'none';
  }
  if (e.target === addModal) {
    addModal.style.display = 'none';
  }
  if (e.target === dailyLimitModal) {
    dailyLimitModal.style.display = 'none';
  }
});
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

// Show logout modal
logoutBtn.addEventListener('click', () => {
  logoutModal.style.display = 'flex';
});

// Cancel logout
cancelLogoutBtn.addEventListener('click', () => {
  logoutModal.style.display = 'none';
});

// Confirm logout (ONLY remove login status)
confirmLogoutBtn.addEventListener('click', () => {
  localStorage.removeItem('isLoggedIn'); // ✅ Keeps all user data
  logoutModal.style.display = 'none';
  window.location.href = 'signin.html'; // Redirect to sign-in page
});

// Close modal if clicking outside content
logoutModal.addEventListener('click', (e) => {
  if (e.target === logoutModal) {
    logoutModal.style.display = 'none';
  }
});

const limitWarningModal = document.getElementById('limit-warning-modal');
const closeWarningModalBtn = document.getElementById('close-warning-modal');
const excessAmountEl = document.getElementById('excess-amount');
const limitValueDisplayEl = document.getElementById('limit-value-display');

function showLimitExceededWarning() {
  const data = spendingData[currentDate];
  const excess = data.total - data.dailyLimit;
  excessAmountEl.textContent = excess.toFixed(0);
  limitValueDisplayEl.textContent = data.dailyLimit.toFixed(0);
  limitWarningModal.style.display = 'flex';
}

function hideLimitExceededWarning() {
  limitWarningModal.style.display = 'none';
}

// Close warning modal
closeWarningModalBtn?.addEventListener('click', () => {
  hideLimitExceededWarning();
});

// Close if clicking outside
limitWarningModal?.addEventListener('click', (e) => {
  if (e.target === limitWarningModal) {
    hideLimitExceededWarning();
  }
});

// Initialize
initUI();