// ═══════════════════════════════════════════════
//  ALERTS.JS — Alert System
// ═══════════════════════════════════════════════

async function renderAlerts() {
  const alerts = await api('/api/alerts');
  const active = alerts.filter(a => !a.dismissed);
  const dismissed = alerts.filter(a => a.dismissed);

  mainContent.innerHTML = `
    <div class="page-header animate-in">
      <h1>Alerts</h1>
      <p>Privacy notifications and warnings</p>
    </div>

    <div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap" class="animate-in">
      <span class="badge red">${active.length} Active</span>
      <span class="badge gray">${dismissed.length} Dismissed</span>
      ${active.length > 0 ? `
        <button class="btn btn-ghost btn-sm" onclick="dismissAllAlerts()" style="margin-left:auto">
          <i data-lucide="check-check"></i> Dismiss All
        </button>
      ` : ''}
    </div>

    <!-- Active Alerts -->
    ${active.length ? `
      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:32px">
        ${active.map((a, i) => `
          <div class="alert-card ${a.type} animate-in" style="animation-delay:${i * 0.05}s">
            <div class="alert-icon ${a.type}">
              <i data-lucide="${a.type === 'danger' ? 'alert-triangle' : a.type === 'warning' ? 'alert-circle' : 'info'}"></i>
            </div>
            <div class="alert-body">
              <div class="alert-message">${a.message}</div>
              <div class="alert-time">${formatTime(a.time)}</div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="dismissAlert(${a.id})">
              <i data-lucide="x"></i>
            </button>
          </div>
        `).join('')}
      </div>
    ` : `
      <div class="card animate-in">
        <div class="empty-state">
          <i data-lucide="check-circle"></i>
          <p>No active alerts — everything looks good!</p>
        </div>
      </div>
    `}

    <!-- Alert History -->
    ${dismissed.length ? `
      <div class="card animate-in" style="margin-top:8px">
        <div class="card-header">
          <div class="card-title"><i data-lucide="history"></i> Alert History</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${dismissed.map(a => `
            <div class="alert-card ${a.type} dismissed">
              <div class="alert-icon ${a.type}">
                <i data-lucide="${a.type === 'danger' ? 'alert-triangle' : a.type === 'warning' ? 'alert-circle' : 'info'}"></i>
              </div>
              <div class="alert-body">
                <div class="alert-message">${a.message}</div>
                <div class="alert-time">${formatTime(a.time)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;

  lucide.createIcons();
}

async function dismissAlert(id) {
  await api(`/api/alerts/dismiss/${id}`, { method: 'POST' });
  showToast('Alert dismissed', 'info');
  renderAlerts();
}

async function dismissAllAlerts() {
  await api('/api/alerts/dismiss-all', { method: 'POST' });
  showToast('All alerts dismissed', 'info');
  renderAlerts();
}
