// Apply saved theme on page load
(function applyTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.classList.add(savedTheme + "-mode");
})();

// DOM elements
const form = document.getElementById('user_inputs');
const nameInput = document.getElementById('name');
const emailOrPhoneInput = document.getElementById('email_or_phone');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirm_password');
const signupBtn = document.getElementById('signup-btn');

const nameError = document.getElementById('name-error');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');
const confirmError = document.getElementById('confirm-error');

function showError(element, message) {
  element.textContent = message;
  element.style.display = 'block';
  const input = element.parentElement.querySelector('input');
  if (input) input.classList.add('invalid');
}
function clearError(element) {
  element.textContent = '';
  element.style.display = 'none';
  const input = element.parentElement.querySelector('input');
  if (input) input.classList.remove('invalid');
}

function isValidEmail(val) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(val);
}
function isValidPhone(val) {
  const digits = val.replace(/\D+/g, '');
  return digits.length >= 7; // minimal check
}

function validateName() {
  const v = nameInput.value.trim();
  if (!v) {
    showError(nameError, 'Please enter your name');
    return false;
  }
  if (v.length < 2) {
    showError(nameError, 'Name must be at least 2 characters');
    return false;
  }
  clearError(nameError);
  return true;
}

function validateEmailOrPhone() {
  const v = emailOrPhoneInput.value.trim();
  if (!v) {
    showError(emailError, 'Please enter your email or phone');
    return false;
  }
  if (isValidEmail(v)) {
    clearError(emailError);
    return true;
  }
  if (isValidPhone(v)) {
    clearError(emailError);
    return true;
  }
  showError(emailError, 'Enter a valid email or phone number');
  return false;
}

function validatePassword() {
  const v = passwordInput.value;
  if (!v) {
    showError(passwordError, 'Please enter a password');
    return false;
  }
  if (v.length < 8) {
    showError(passwordError, 'Password must be at least 8 characters');
    return false;
  }
  clearError(passwordError);
  return true;
}

function validateConfirm() {
  if (confirmInput.value !== passwordInput.value) {
    showError(confirmError, 'Passwords do not match');
    return false;
  }
  clearError(confirmError);
  return true;
}

// Password visibility toggle
const togglePasswordBtn = document.getElementById('toggle-password');
let isPasswordVisible = false;
togglePasswordBtn.addEventListener('click', (e) => {
  e.preventDefault();
  isPasswordVisible = !isPasswordVisible;
  if (isPasswordVisible) {
    passwordInput.type = 'text';
    confirmInput.type = 'text';
    togglePasswordBtn.textContent = '🙈';
  } else {
    passwordInput.type = 'password';
    confirmInput.type = 'password';
    togglePasswordBtn.textContent = '👁️';
  }
});

// Real-time validation
nameInput.addEventListener('input', () => { if (nameInput.value.trim()) clearError(nameError); });
emailOrPhoneInput.addEventListener('input', () => { if (emailOrPhoneInput.value.trim()) clearError(emailError); });
passwordInput.addEventListener('input', () => { if (passwordInput.value.length >= 8) clearError(passwordError); });
confirmInput.addEventListener('input', () => { if (confirmInput.value === passwordInput.value) clearError(confirmError); });

// Form submit handler
form.addEventListener('signup-btn', function (e) {
  // run validations
  const nOK = validateName();
  const eOK = validateEmailOrPhone();
  const pOK = validatePassword();
  const cOK = validateConfirm();

  if (!(nOK && eOK && pOK && cOK)) {
    e.preventDefault();
    return;
  }

  // disable button to prevent double submit
  signupBtn.disabled = true;
  signupBtn.textContent = 'Signing up...';

  // let the form submit normally (server-side will do authoritative checks)
});
