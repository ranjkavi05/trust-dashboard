// ═══════════════════════════════════════════════
//  APP.JS — Client-side router & global helpers
// ═══════════════════════════════════════════════

const mainContent = document.getElementById('main-content');
const sidebarNav  = document.getElementById('sidebar-nav');
const sidebar     = document.getElementById('sidebar');
const hamburger   = document.getElementById('hamburger');
const overlay     = document.getElementById('sidebar-overlay');

// ── Page registry ──────────────────────────────
const pages = {
  dashboard:     () => renderDashboard(),
  permissions:   () => renderPermissions(),
  services:      () => renderServices(),
  'privacy-score': () => renderPrivacyScore(),
  alerts:        () => renderAlerts(),
  logs:          () => renderLogs(),
  'data-usage':  () => renderDataUsage(),
  profile:       () => renderProfile(),
  settings:      () => renderSettings(),
};

let currentPage = 'dashboard';

// ── Navigate ───────────────────────────────────
async function navigate(page) {
  if (!pages[page]) return;
  currentPage = page;

  // Update active nav
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  // Close mobile sidebar
  sidebar.classList.remove('open');
  overlay.classList.remove('open');

  // Render
  await pages[page]();
  lucide.createIcons();
}

// ── Sidebar click ──────────────────────────────
sidebarNav.addEventListener('click', e => {
  const item = e.target.closest('.nav-item');
  if (!item) return;
  e.preventDefault();
  navigate(item.dataset.page);
});

// ── Mobile menu ────────────────────────────────
hamburger.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
});

overlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  overlay.classList.remove('open');
});

// ── Toast helper ───────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-message">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ── Fetch helper ───────────────────────────────
async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return res.json();
}

// ── Time formatting ────────────────────────────
function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Theme Manager ──────────────────────────────
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  
  const currentTheme = savedTheme || (prefersLight ? 'light' : 'dark');
  setTheme(currentTheme, themeToggle);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      setTheme(newTheme, themeToggle);
    });
  }
}

function setTheme(theme, toggleBtn) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  if (toggleBtn) {
    const iconName = theme === 'light' ? 'moon' : 'sun';
    toggleBtn.innerHTML = `<i data-lucide="${iconName}"></i>`;
    lucide.createIcons();
  }
}

// ── 3D Tilt Effect ─────────────────────────────
function initTilt() {
  if (typeof VanillaTilt !== 'undefined') {
    const attachTilt = (selector, options) => {
      document.querySelectorAll(selector).forEach(el => {
        if (!el.vanillaTilt) VanillaTilt.init(el, options);
      });
    };

    // Generic cards
    attachTilt('.card', {
      max: 3,
      speed: 400,
      glare: true,
      "max-glare": 0.15,
      scale: 1.01
    });

    // Make the Privacy Score ring pop out interactively
    attachTilt('.score-ring-container', {
      max: 15,
      speed: 300,
      scale: 1.05
    });
  }
}

// Automatically init tilt when content changes (like navigating to new tabs)
const tiltObserver = new MutationObserver(() => initTilt());
const mainContentNode = document.getElementById('main-content');
if (mainContentNode) {
  tiltObserver.observe(mainContentNode, { childList: true, subtree: true });
}

// ── Tour Manager ───────────────────────────────
function setupTour() {
  if (typeof introJs !== 'undefined') {
    if (!localStorage.getItem('tour_done')) {
      setTimeout(() => {
        introJs().setOptions({
          showProgress: true,
          showBullets: false,
          disableInteraction: false,
          tooltipClass: 'custom-intro-tooltip'
        }).start().oncomplete(() => {
          localStorage.setItem('tour_done', 'true');
        });
      }, 800);
    }
  }
}

// ── Dropdown Helper ────────────────────────────
window.closeUserMenu = function() {
  const ud = document.getElementById('user-dropdown');
  if (ud) ud.classList.remove('open');
};

// ── User UI Sync ───────────────────────────────
window.refreshUserUI = async function() {
  try {
    const user = await api('/api/user');
    document.querySelectorAll('.user-name').forEach(el => el.textContent = user.name);
    document.querySelectorAll('.user-email, .ud-header small').forEach(el => el.textContent = user.email);
    document.querySelectorAll('.avatar').forEach(el => el.textContent = user.initials.toUpperCase());
  } catch (err) {
    console.error('Failed to load user', err);
  }
};

// ── Init ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  refreshUserUI().then(() => {
    navigate('dashboard');
  });

  const userTrigger = document.getElementById('user-profile-trigger');
  const userDropdown = document.getElementById('user-dropdown');
  if (userTrigger && userDropdown) {
    userTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('open');
    });
  }

  document.addEventListener('click', (e) => {
    if (userDropdown && userDropdown.classList.contains('open')) {
      if (!userDropdown.contains(e.target) && !userTrigger.contains(e.target)) {
        closeUserMenu();
      }
    }
  });

  const demoBtn = document.getElementById('demo-attack-btn');
  if (demoBtn) {
    demoBtn.addEventListener('click', async () => {
      // Get current services to check if spyware already exists
      const services = await api('/api/services');
      const hasSpyware = services.some(s => s.name === 'Unknown Spyware');
      
      if (hasSpyware) {
        // Remove spyware (green flash = secure)
        await fetch('/api/demo/remove-attack', { method: 'POST' });
        document.body.classList.add('screen-secure');
        showToast('✅ System Secure! No threats detected.', 'info');
        
        setTimeout(() => {
          document.body.classList.remove('screen-secure');
          navigate(currentPage);
        }, 1500);
      } else {
        // Add spyware (red flash = breach)
        document.body.classList.add('screen-glitch');
        await fetch('/api/demo/attack', { method: 'POST' });
        showToast('Simulating Data Breach...', 'warning');
        
        setTimeout(() => {
          document.body.classList.remove('screen-glitch');
          navigate(currentPage);
          showToast('🚨 CRITICAL: Unknown Spyware accessed Camera!', 'error');
        }, 1000);
      }
    });
  }
});
