// Apply saved theme on load
(function applyTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.add(savedTheme + '-mode');
  })();
  
  // Modal elements
  const modal = document.getElementById('message-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalText = document.getElementById('modal-text');
  const modalClose = document.getElementById('modal-close');
  
  // Show modal with dynamic title/message
  function showModal(title, message) {
    modalTitle.textContent = title;
    modalText.textContent = message;
    modal.style.display = 'flex';
  }
  
  // Close modal
  modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  // Close if clicking outside content
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Sign-in logic
  document.getElementById('signin-btn').addEventListener('click', () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
  
    // Simple demo: check if user exists in localStorage
    const userData = JSON.parse(localStorage.getItem('userData'));
  
    if (userData && userData.email === email) {
      localStorage.setItem('isLoggedIn', 'true');
      showModal('Success!', 'Signed in successfully!');
  
      setTimeout(() => {
        window.location.href = 'Homepage.html';
      }, 1000);
    } else {
      showModal('Account Not Found', 'Please sign up first.');
    }
  });