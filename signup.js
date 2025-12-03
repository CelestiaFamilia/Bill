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

signupBtn.addEventListener('click', async (e) => {
  e.preventDefault(); // Prevent page reload

  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();

  if (!isNameValid || !isEmailValid || !isPasswordValid) {
    return;
  }

  const userData = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value
  };

  try {
    const response = await fetch('signup.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    // Log raw response for debugging
    const text = await response.text();
    console.log('Raw response:', text);

    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(text);
    } catch (jsonErr) {
      throw new Error(`Invalid JSON response: ${text}`);
    }

    if (result.success) {
      alert(result.message || 'Account created!');
      window.location.href = result.redirect || 'signin.html';
    } else {
      alert(`Signup failed: ${result.message || 'Unknown error.'}`);
    }
  } catch (err) {
    alert(`Network error: ${err.message}`);
    console.error('Signup error details:', err);
  }
});