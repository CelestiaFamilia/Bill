document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme
  (function applyTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.add(savedTheme + '-mode');
  })();

  // Modal elements
  const messageModal = document.getElementById('message-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalText = document.getElementById('modal-text');
  const modalClose = document.getElementById('modal-close');

  const forgotModal = document.getElementById('forgot-modal');
  const forgotLink = document.getElementById('forgot-password');
  const cancelReset = document.getElementById('cancel-reset');
  const sendReset = document.getElementById('send-reset');
  const resetEmailInput = document.getElementById('reset-email');
  const emailInput = document.getElementById('email');

  // Show message modal
  function showMessageModal(title, message) {
    modalTitle.textContent = title;
    modalText.textContent = message;
    messageModal.style.display = 'flex';
  }

  // Close modals
  modalClose.onclick = () => messageModal.style.display = 'none';
  cancelReset.onclick = () => forgotModal.style.display = 'none';

  window.onclick = (e) => {
    if (e.target === messageModal) messageModal.style.display = 'none';
    if (e.target === forgotModal) forgotModal.style.display = 'none';
  };

  // === NEW: Direct Password Reset Logic ===
forgotLink.addEventListener('click', (e) => {
  e.preventDefault();
  resetEmailInput.value = emailInput.value || '';
  document.getElementById('new-password').value = ''; // Clear new password
  document.getElementById('reset-modal').style.display = 'flex';
});

// Close reset modal
document.getElementById('cancel-reset').onclick = () => {
  document.getElementById('reset-modal').style.display = 'none';
};

// Handle direct password reset
document.getElementById('confirm-reset').addEventListener('click', async () => {
  const email = document.getElementById('reset-email').value.trim();
  const newPassword = document.getElementById('new-password').value;

  if (!email || !email.includes('@') || !email.includes('.')) {
    showMessageModal('Invalid Email', 'Please enter a valid email address.');
    return;
  }

  if (!newPassword || newPassword.length < 6) {
    showMessageModal('Weak Password', 'Password must be at least 6 characters.');
    return;
  }

  const btn = document.getElementById('confirm-reset');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Updating...';

  try {
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('new_password', newPassword);

    const response = await fetch('reset_password.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      showMessageModal('Success!', data.message);
      document.getElementById('reset-modal').style.display = 'none';
    } else {
      showMessageModal('Error', data.message);
    }
  } catch (err) {
    console.error('Reset error:', err);
    showMessageModal('Error', 'Failed to update password. Try again.');
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
});

  // Password visibility toggle
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('toggle-password');
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
  });

  // Sign-in logic
  const signinBtn = document.getElementById('signin-btn');
  if (!signinBtn) {
    console.error("❌ #signin-btn not found!");
    return;
  }

  signinBtn.addEventListener('click', async () => {
    const email = document.getElementById('email')?.value.trim() || '';
    const password = document.getElementById('password')?.value || '';

    console.log('📧 Sending email:', email);      // 👈 ADD THIS
    console.log('🔑 Password length:', password.length); // 👈 ADD THIS

    if (!email || !password) {
        showMessageModal('Error', 'Please enter both email and password.');
        return;
    }
    // ... rest of code

    // ✅ Build form-encoded data
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);

    const btn = document.getElementById('signin-btn');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Signing in...';

    try {
      const response = await fetch('signin.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        showMessageModal('Success!', data.message);
        setTimeout(() => {
          window.location.href = data.redirect;
        }, 1200);
      } else {
        showMessageModal('Sign In Failed', data.message);
      }
    } catch (err) {
      console.error('Network error:', err);
      showMessageModal('Connection Error', 'Unable to reach the server.');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
});