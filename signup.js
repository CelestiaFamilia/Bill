// Apply saved theme on page load
(function applyTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.classList.add(savedTheme + '-mode');
})();

// Get DOM elements
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupBtn = document.getElementById('signup-btn');

// Error message elements
const nameError = document.getElementById('name-error');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');

// Validation functions
function showError(element, message) {
  element.textContent = message;
  element.style.display = 'block';
  element.parentElement.querySelector('input').classList.add('invalid');
}

function clearError(element) {
  element.textContent = '';
  element.style.display = 'none';
  element.parentElement.querySelector('input').classList.remove('invalid');
}

function validateName() {
  const value = nameInput.value.trim();
  if (!value) {
    showError(nameError, 'Please enter your name');
    return false;
  }
  clearError(nameError);
  return true;
}

function validateEmail() {
  const value = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!value) {
    showError(emailError, 'Please enter your email');
    return false;
  }
  if (!emailRegex.test(value)) {
    showError(emailError, 'Please enter a valid email address');
    return false;
  }
  clearError(emailError);
  return true;
}

function validatePassword() {
  const value = passwordInput.value;
  if (!value) {
    showError(passwordError, 'Please enter a password');
    return false;
  }
  if (value.length < 6) {
    showError(passwordError, 'Password must be at least 6 characters');
    return false;
  }
  clearError(passwordError);
  return true;
}

// Password visibility toggle
const togglePasswordBtn = document.getElementById('toggle-password');
let isPasswordVisible = false;

togglePasswordBtn.addEventListener('click', () => {
  isPasswordVisible = !isPasswordVisible;
  
  if (isPasswordVisible) {
    passwordInput.type = 'text';
    togglePasswordBtn.textContent = '🙈'; // Hide
  } else {
    passwordInput.type = 'password';
    togglePasswordBtn.textContent = '👁️'; // Show
  }
});

// Real-time validation as user types
nameInput.addEventListener('blur', validateName);
emailInput.addEventListener('blur', validateEmail);
passwordInput.addEventListener('blur', validatePassword);

nameInput.addEventListener('input', () => {
  if (nameInput.value.trim()) clearError(nameError);
});

emailInput.addEventListener('input', () => {
  if (emailInput.value.trim()) clearError(emailError);
});

passwordInput.addEventListener('input', () => {
  if (passwordInput.value.length >= 6) clearError(passwordError);
});

// Sign-up handler
signupBtn.addEventListener('click', () => {
  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();

  // If all fields are valid
  if (isNameValid && isEmailValid && isPasswordValid) {
    // Save minimal user data (no password stored for demo)
    localStorage.setItem('userData', JSON.stringify({
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      gender: 'Not set',
      birthday: '',
      phone: '',
      address: '',
      profileImage: null
    }));

    localStorage.setItem('isLoggedIn', 'true');

    // Redirect to sign-in page after success
    window.location.href = 'signin.html';
  }
});