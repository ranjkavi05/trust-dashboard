// ═══════════════════════════════════════════════
//  DASHBOARD.JS — Overview page
// ═══════════════════════════════════════════════

async function renderDashboard() {
  const [permissions, services, scoreData, alerts, dataUsage] = await Promise.all([
    api('/api/permissions'),
    api('/api/services'),
    api('/api/privacy-score'),
    api('/api/alerts'),
    api('/api/data-usage'),
  ]);

  const activePerms = permissions.filter(p => p.enabled).length;
  const activeServices = services.filter(s => s.status === 'active').length;
  const highRisk = services.filter(s => s.riskLevel === 'high').length;
  const activeAlerts = alerts.filter(a => !a.dismissed).length;
  
  const dataValue = (activePerms * 15) + (activeServices * 5) + (highRisk * 30);

  mainContent.innerHTML = `
    <div class="page-header animate-in" style="display:flex; justify-content:space-between; align-items:flex-end;">
      <div>
        <h1>Dashboard</h1>
        <p>Your privacy overview at a glance</p>
      </div>
      <button id="auto-secure-btn" class="btn btn-primary" data-intro="Click this magic wand to prioritize privacy and boost your score instantly!" data-step="3">
        <i data-lucide="wand-2"></i> Optimize Privacy
      </button>
    </div>

    <!-- Score + Quick Stats -->
    <div class="card animate-in" style="margin-bottom:24px">
      <div class="dashboard-score-section">
        <div class="score-ring-container" data-intro="Welcome to Hushh. This score shows your overall privacy health based on your data exposure." data-step="1">
          <div class="score-ring">
            <svg viewBox="0 0 200 200">
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:${scoreData.score >= 80 ? '#22c55e' : scoreData.score >= 50 ? '#eab308' : '#ef4444'}" />
                  <stop offset="100%" style="stop-color:${scoreData.score >= 80 ? '#06b6d4' : scoreData.score >= 50 ? '#f97316' : '#dc2626'}" />
                </linearGradient>
              </defs>
              <circle class="ring-bg" cx="100" cy="100" r="85" />
              <circle class="ring-fill" cx="100" cy="100" r="85"
                stroke-dasharray="${2 * Math.PI * 85}"
                stroke-dashoffset="${2 * Math.PI * 85 * (1 - scoreData.score / 100)}" />
            </svg>
            <div class="score-value">
              <div class="score-number">${scoreData.score}</div>
              <div class="score-label ${scoreData.label.toLowerCase()}">${scoreData.label}</div>
            </div>
          </div>
          <div style="font-size:0.82rem;color:var(--text-muted)">Privacy Score</div>
        </div>

        <div class="quick-stats">
          <div class="quick-stat">
            <i data-lucide="toggle-right" style="color:var(--accent-blue)"></i>
            <span>Active Permissions</span>
            <span class="qs-value">${activePerms}/${permissions.length}</span>
          </div>
          <div class="quick-stat">
            <i data-lucide="plug" style="color:var(--accent-cyan)"></i>
            <span>Connected Apps</span>
            <span class="qs-value">${activeServices}</span>
          </div>
          <div class="quick-stat">
            <i data-lucide="alert-triangle" style="color:var(--red)"></i>
            <span>High Risk Apps</span>
            <span class="qs-value">${highRisk}</span>
          </div>
          <div class="quick-stat">
            <i data-lucide="bell-ring" style="color:var(--yellow)"></i>
            <span>Active Alerts</span>
            <span class="qs-value">${activeAlerts}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stat Cards Row -->
    <div class="grid-4" style="margin-bottom:24px">
      <div class="card animate-in stat-card">
        <div class="stat-icon blue"><i data-lucide="toggle-right"></i></div>
        <div>
          <div class="stat-value">${activePerms}</div>
          <div class="stat-label">Active Permissions</div>
        </div>
      </div>
      <div class="card animate-in stat-card">
        <div class="stat-icon purple"><i data-lucide="plug"></i></div>
        <div>
          <div class="stat-value">${activeServices}</div>
          <div class="stat-label">Connected Apps</div>
        </div>
      </div>
      <div class="card animate-in stat-card">
        <div class="stat-icon red"><i data-lucide="alert-triangle"></i></div>
        <div>
          <div class="stat-value">${highRisk}</div>
          <div class="stat-label">High Risk</div>
        </div>
      </div>
      <div class="card animate-in stat-card" data-intro="This calculates the estimated commercial value of the data you are exposing." data-step="2">
        <div class="stat-icon orange"><i data-lucide="dollar-sign"></i></div>
        <div>
          <div class="stat-value">$${dataValue}</div>
          <div class="stat-label">Data Exposure Value</div>
        </div>
      </div>
      <div class="card animate-in stat-card">
        <div class="stat-icon green"><i data-lucide="shield-check"></i></div>
        <div>
          <div class="stat-value">${scoreData.score}</div>
          <div class="stat-label">Trust Score</div>
        </div>
      </div>
    </div>

    <!-- Bottom Grid -->
    <div class="grid-2">
      <!-- Recent Alerts -->
      <div class="card animate-in">
        <div class="card-header">
          <div class="card-title"><i data-lucide="bell-ring"></i> Recent Alerts</div>
          <button class="btn btn-ghost btn-sm" onclick="navigate('alerts')">View All</button>
        </div>
        ${alerts.filter(a => !a.dismissed).slice(0, 3).map(a => `
          <div class="alert-card ${a.type}" style="margin-bottom:8px">
            <div class="alert-icon ${a.type}">
              <i data-lucide="${a.type === 'danger' ? 'alert-triangle' : a.type === 'warning' ? 'alert-circle' : 'info'}"></i>
            </div>
            <div class="alert-body">
              <div class="alert-message">${a.message}</div>
              <div class="alert-time">${formatTime(a.time)}</div>
            </div>
          </div>
        `).join('') || '<div class="empty-state"><p>No active alerts ✅</p></div>'}
      </div>

      <!-- Data Usage Mini Chart -->
      <div class="card animate-in">
        <div class="card-header">
          <div class="card-title"><i data-lucide="pie-chart"></i> Data Usage</div>
          <button class="btn btn-ghost btn-sm" onclick="navigate('data-usage')">Details</button>
        </div>
        <div class="chart-container">
          <canvas id="dashboard-pie"></canvas>
        </div>
      </div>
    </div>
  `;

  lucide.createIcons();

  // Render mini pie chart
  const ctx = document.getElementById('dashboard-pie');
  if (ctx && dataUsage.usage) {
    const labels = Object.keys(dataUsage.usage);
    const values = Object.values(dataUsage.usage);
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e', '#eab308', '#ef4444', '#f97316'];
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: colors.slice(0, labels.length), borderWidth: 0 }],
      },
      options: {
        responsive: true,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16, font: { family: 'Inter' } } },
        },
      },
    });
  }

  // Attach Optimize Privacy listener
  const autoBtn = document.getElementById('auto-secure-btn');
  if (autoBtn) {
    autoBtn.addEventListener('click', async () => {
      autoBtn.classList.add('btn-optimizing');
      // Wait for the animation to play its magical glow a couple times
      setTimeout(async () => {
        const response = await fetch('/api/secure-all', { method: 'POST' });
        const data = await response.json();
        showToast('Privacy optimized! Score increased to ' + data.score.score + ' 🛡️', 'info');
        autoBtn.classList.remove('btn-optimizing');
        navigate('dashboard');
      }, 1200);
    });
  }
}
