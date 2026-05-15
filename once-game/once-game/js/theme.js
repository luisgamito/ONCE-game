// TEMA CLARO / OSCURO
// ============================================================
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('once_theme', theme);
  const icon = theme === 'light' ? '🌙' : '☀️';
  ['themeBtn','themeBtnIntro','themeBtnMatch'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = icon;
  });
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'light' ? 'dark' : 'light');
}

