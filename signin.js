document.addEventListener("DOMContentLoaded", () => {
  // === Apply saved theme from localStorage ===
  (function applyTheme() {
    const savedTheme = localStorage.getItem("theme") || "dark"; // Default to dark mode
    document.body.classList.add(savedTheme + "-mode"); // Apply theme class to body
  })();

  // === Modal elements ===
  const messageModal = document.getElementById("message-modal"); // Main message modal
  const modalTitle = document.getElementById("modal-title"); // Modal title text
  const modalText = document.getElementById("modal-text"); // Modal body text
  const modalClose = document.getElementById("modal-close"); // Close button

  const forgotModal = document.getElementById("forgot-modal"); // Forgot password modal
  const forgotLink = document.getElementById("forgot-password"); // "Forgot Password?" link
  const cancelReset = document.getElementById("cancel-reset"); // Cancel button in reset modal
  const sendReset = document.getElementById("send-reset"); // Send reset button (if used elsewhere)
  const resetEmailInput = document.getElementById("reset-email"); // Input for email in reset modal
  const emailInput = document.getElementById("email"); // Main email input field

  const otpModal = document.getElementById("otp-modal"); // OTP modal
  const sendCodeBtn = document.getElementById("send-code"); // Trigger button
  const closeOtpBtn = document.getElementById("close-otp"); // Close button
  // === Show message modal ===
  function showMessageModal(title, message) {
    modalTitle.textContent = title; // Set modal title
    modalText.textContent = message; // Set modal message
    messageModal.style.display = "flex"; // Display modal
  }

  // === Close modals ===
  modalClose.onclick = () => (messageModal.style.display = "none"); // Close message modal
  cancelReset.onclick = () => (forgotModal.style.display = "none"); // Close forgot modal

  // Close modals when clicking outside of them
  window.onclick = (e) => {
    if (e.target === messageModal) messageModal.style.display = "none";
    if (e.target === forgotModal) forgotModal.style.display = "none";
  };

  // === Direct Password Reset Logic ===
  forgotLink.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default link behavior
    resetEmailInput.value = emailInput.value || ""; // Pre-fill email in reset modal
    document.getElementById("new-password").value = ""; // Clear new password input
    document.getElementById("reset-modal").style.display = "flex"; // Show reset modal
  });

  // Close reset modal
  document.getElementById("cancel-reset").onclick = () => {
    document.getElementById("reset-modal").style.display = "none";
  };

  // Handle direct password reset submission
  document
    .getElementById("confirm-reset")
    .addEventListener("click", async () => {
      const email = document.getElementById("reset-email").value.trim(); // Get email input
      const newPassword = document.getElementById("new-password").value; // Get new password input
      const otp = document.getElementById("otp").value;

      // Validate email
      if (!email || !email.includes("@") || !email.includes(".")) {
        showMessageModal(
          "Invalid Email",
          "Please enter a valid email address."
        );
        return;
      }

      // Validate password length
      if (!newPassword || newPassword.length < 6) {
        showMessageModal(
          "Weak Password",
          "Password must be at least 6 characters."
        );
        return;
      }

      const btn = document.getElementById("confirm-reset");
      const originalText = btn.textContent;
      btn.disabled = true; // Disable button while processing
      btn.textContent = "Updating..."; // Show loading text

      try {
        // Prepare form data
        const formData = new URLSearchParams();
        formData.append("email", email);
        formData.append("new_password", newPassword);
        formData.append("otp", otp);

        // Send POST request to reset_password.php
        const response = await fetch("reset_password.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        });

        const data = await response.json(); // Parse JSON response

        if (data.success) {
          showMessageModal("Success!", data.message); // Show success message
          document.getElementById("reset-modal").style.display = "none"; // Close modal
        } else {
          showMessageModal("Error", data.message); // Show error message
        }
      } catch (err) {
        console.error("Reset error:", err);
        showMessageModal("Error", "Failed to update password. Try again.");
      } finally {
        btn.disabled = false; // Re-enable button
        btn.textContent = originalText; // Restore button text
      }
    });

  // === Password visibility toggle ===
  const passwordInput = document.getElementById("password"); // Main password input
  const togglePasswordBtn = document.getElementById("toggle-password"); // Toggle button
  togglePasswordBtn.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password"; // Toggle type
    togglePasswordBtn.textContent = isPassword ? "🙈" : "👁️"; // Toggle icon
  });

  // === Sign-in logic ===
  const signinBtn = document.getElementById("signin-btn"); // Sign-in button
  if (!signinBtn) {
    console.error("❌ #signin-btn not found!");
    return;
  }

  signinBtn.addEventListener("click", async () => {
    const email = document.getElementById("email")?.value.trim() || ""; // Get email
    const password = document.getElementById("password")?.value || ""; // Get password

    console.log("📧 Sending email:", email); // Debug email
    console.log("🔑 Password length:", password.length); // Debug password length

    // Validate inputs
    if (!email || !password) {
      showMessageModal("Error", "Please enter both email and password.");
      return;
    }

    // Build form-encoded data
    const formData = new URLSearchParams();
    formData.append("email", email);
    formData.append("password", password);

    const btn = document.getElementById("signin-btn");
    const originalText = btn.textContent;
    btn.disabled = true; // Disable button while processing
    btn.textContent = "Signing in..."; // Show loading text

    try {
      // Send POST request to signin.php
      const response = await fetch("signin.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const data = await response.json(); // Parse JSON response

      if (data.success) {
        showMessageModal("Success!", data.message); // Show success message
        setTimeout(() => {
          window.location.href = data.redirect; // Redirect after delay
        }, 1200);
      } else {
        showMessageModal("Sign In Failed", data.message); // Show error message
      }
    } catch (err) {
      console.error("Network error:", err);
      showMessageModal("Connection Error", "Unable to reach the server."); // Network error
    } finally {
      btn.disabled = false; // Re-enable button
      btn.textContent = originalText; // Restore button text
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    // Show OTP modal when send-code button is clicked
    sendCodeBtn.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent default link behavior
      otpModal.style.display = "flex"; // Show modal
    });

    // Close modal on close button click
    closeOtpBtn.addEventListener("click", () => {
      otpModal.style.display = "none";
    });

    // Close modal if clicking outside the modal content
    window.addEventListener("click", (e) => {
      if (e.target === otpModal) {
        otpModal.style.display = "none";
      }
    });
  });
});
