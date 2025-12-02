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

// Forgot password: open modal and pre-fill email
forgotLink.addEventListener('click', (e) => {
  e.preventDefault();
  resetEmailInput.value = emailInput.value || '';
  forgotModal.style.display = 'flex';
});

sendReset.addEventListener('click', () => {
  const email = resetEmailInput.value.trim();
  if (!email || !email.includes('@') || !email.includes('.')) {
    showMessageModal('Invalid Email', 'Please enter a valid email address.');
    return;
  }

  // 🔗 Replace this with YOUR actual Google Form link
  const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSeVMOBs3z3P0RIEjLvwFgzIg_hP3IUASCJpJTnf2oXwJ89f7Q/viewform?usp=dialog' + encodeURIComponent(email);

  window.open(formUrl, '_blank');
  forgotModal.style.display = 'none';
  showMessageModal('Help Request Sent', 'Please complete the form to request password help.');
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
document.getElementById('signin-btn').addEventListener('click', () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  const userData = JSON.parse(localStorage.getItem('userData'));

  if (userData && userData.email === email) {
    localStorage.setItem('isLoggedIn', 'true');
    showMessageModal('Success!', 'Signed in successfully!');
    setTimeout(() => {
      window.location.href = 'Homepage.html';
    }, 1000);
  } else {
    showMessageModal('Account Not Found', 'Please sign up first.');
  }
});