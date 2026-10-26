// ==============================================================================
// Global Application Script (frontend/js/app.js)
// Handles active navigation state and common layout interactions
// ==============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Highlight active navigation link
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-item a');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Match exact page name or default index.html for root "/"
    if (
      (currentPath.endsWith(href) && href !== 'index.html') ||
      ((currentPath === '/' || currentPath.endsWith('index.html')) && href === 'index.html')
    ) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 2. Set current year in footer dynamically
  const yearSpan = document.getElementById('footer-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});
