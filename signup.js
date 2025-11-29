// Apply saved theme on page load
(function applyTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.add(savedTheme + '-mode');
  })();
  
  // Modal elements
  const modal = document.getElementById('message-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalText = document.getElementById('modal-text');
  const modalClose = document.getElementById('modal-close');
  
  // Show modal with optional auto-redirect on success
  function showModal(title, message, isSuccess = false) {
    modalTitle.textContent = title;
    modalText.textContent = message;
    modal.style.display = 'flex';
  
    if (isSuccess) {
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    }
  }
  
  // Close modal
  modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Sign-up handler
  document.getElementById('signup-btn').addEventListener('click', () => {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
  
    if (!name || !email || password.length < 6) {
      showModal(
        'Invalid Input',
        'Please fill all fields correctly. Password must be at least 6 characters.'
      );
      return;
    }
  
    // Save minimal user data (no password stored for demo)
    localStorage.setItem('userData', JSON.stringify({
      name,
      email,
      gender: 'Not set',
      birthday: '',
      phone: '',
      address: '',
      profileImage: null
    }));
  
    localStorage.setItem('isLoggedIn', 'true');
    showModal('Success!', 'Account created successfully!', true);
  });