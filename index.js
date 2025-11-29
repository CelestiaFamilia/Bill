// Apply saved theme
(function applyTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.add(savedTheme + '-mode');
    updateThemeIcon(savedTheme);
  })();

  function updateThemeIcon(theme) {
    document.getElementById('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');
    const newTheme = isDark ? 'light' : 'dark';
    document.body.className = document.body.className
      .replace(/\b(light-mode|dark-mode)\b/g, '')
      .trim();
    document.body.classList.add(newTheme + '-mode');
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Form submission with modal
  const form = document.getElementById('contact-form');
  const modal = document.getElementById('success-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const modalMessage = document.getElementById('modal-message');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    modalMessage.textContent = `Thank you, ${name}! We’ve received your message and will reply soon.`;
    modal.style.display = 'flex';
  });

  closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    form.reset();
  });

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      form.reset();
    }
  });