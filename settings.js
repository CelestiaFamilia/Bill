// Load saved data
const userData = JSON.parse(localStorage.getItem('userData')) || {
    name: 'kagura',
    gender: 'Female',
    birthday: 'May 8, 2005',
    phone: '09912398765',
    email: 'kagurahimme@gmail.com',
    address: 'Cyberion District',
    profileImage: null
  };
  
  // Get latest daily limit from any date (or default)
  let dailyLimit = 200;
  const spendingData = JSON.parse(localStorage.getItem('spendingDataV2')) || {};
  const dates = Object.keys(spendingData);
  if (dates.length > 0) {
    dailyLimit = spendingData[dates[0]].dailyLimit || 200;
  }
  
  // Populate fields
  document.getElementById('name').value = userData.name;
  document.getElementById('gender').value = userData.gender;
  document.getElementById('birthday').value = userData.birthday;
  document.getElementById('phone').value = userData.phone;
  document.getElementById('email').value = userData.email;
  document.getElementById('address').value = userData.address;
  document.getElementById('daily-limit').value = dailyLimit;
  
  // Initialize profile image preview
  function initProfileImage() {
    const profilePreview = document.getElementById('profile-preview');
    const previewPlaceholder = document.getElementById('preview-placeholder');
  
    if (userData.profileImage) {
      profilePreview.innerHTML = `<img src="${userData.profileImage}" alt="Profile">`;
      previewPlaceholder.style.display = 'none';
    } else {
      const firstLetter = userData.name.charAt(0).toUpperCase();
      previewPlaceholder.textContent = firstLetter;
      profilePreview.style.background = `url('https://via.placeholder.com/120/FF69B4/ffffff?text=  ${firstLetter}') center/cover no-repeat`;
    }
  }
  
  initProfileImage();
  
  // Handle profile image upload
  document.getElementById('image-upload-btn').addEventListener('click', () => {
    document.getElementById('profile-image-input').click();
  });
  
  document.getElementById('profile-image-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        userData.profileImage = imageUrl;
        document.getElementById('profile-preview').innerHTML = `<img src="${imageUrl}" alt="Profile">`;
        document.getElementById('preview-placeholder').style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Notification function
  function showNotification(message) {
    const modal = document.getElementById('notification-modal');
    const text = document.getElementById('notification-text');
    text.textContent = message;
    modal.classList.add('show');
  
    // Auto-close after 3 seconds
    setTimeout(() => {
      modal.classList.remove('show');
    }, 3000);
  
    // Close on click (once)
    modal.addEventListener('click', () => {
      modal.classList.remove('show');
    }, { once: true });
  }
  
  // Save settings
  document.getElementById('save-btn').addEventListener('click', () => {
    const name = document.getElementById('name').value.trim();
    const gender = document.getElementById('gender').value.trim();
    const birthday = document.getElementById('birthday').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    const limit = parseFloat(document.getElementById('daily-limit').value);
  
    if (!name || !email || isNaN(limit) || limit < 0) {
      showNotification('Please fill all required fields correctly.');
      return;
    }
  
    // Save user data
    localStorage.setItem('userData', JSON.stringify({
      name,
      gender,
      birthday,
      phone,
      email,
      address,
      profileImage: userData.profileImage
    }));
  
    // Update daily limit for all existing dates
    const updatedSpending = { ...spendingData };
    for (const date in updatedSpending) {
      updatedSpending[date].dailyLimit = limit;
    }
    localStorage.setItem('spendingDataV2', JSON.stringify(updatedSpending));
  
    showNotification('Settings saved!');
  
    // Redirect after delay
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  });
  
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    body.classList.remove('dark-mode');
    themeToggle.checked = false;
  } else {
    body.classList.add('dark-mode');
    themeToggle.checked = true;
  }
  
  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      body.classList.add('dark-mode');
      body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      body.classList.add('light-mode');
      body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  });
  
  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    localStorage.removeItem('spendingDataV2');
    
    // Redirect without alert
    window.location.href = 'landingpage.html';
  });