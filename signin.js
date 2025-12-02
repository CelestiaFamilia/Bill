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

// Send reset link (mock validation)
sendReset.addEventListener('click', () => {
  const email = resetEmailInput.value.trim();
  if (!email) {
    showMessageModal('Error', 'Please enter your email address.');
    return;
  }
  if (!email.includes('@') || !email.includes('.')) {
    showMessageModal('Invalid Email', 'Please enter a valid email address.');
    return;
  }
  showMessageModal('Check Your Email', `A password reset link has been sent to:\n\n${email}`);
  forgotModal.style.display = 'none';
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

  const formData = new FormData();
  formData.append('email',email);
  formData.append('password',password);

  fetch('login.php',{
    method:'POST',
    body: formData

  })


})
 