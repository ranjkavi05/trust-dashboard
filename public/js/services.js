// ═══════════════════════════════════════════════
//  SERVICES.JS — Connected Services module
// ═══════════════════════════════════════════════

async function renderServices() {
  const services = await api('/api/services');

  mainContent.innerHTML = `
    <div class="page-header animate-in">
      <h1>Connected Services</h1>
      <p>Monitor and manage apps accessing your data</p>
    </div>

    <div class="grid-3">
      ${services.map((s, i) => `
        <div class="card animate-in service-card-wrap" style="animation-delay:${i * 0.05}s">
          <div class="service-card">
            <div class="service-icon">
              <i data-lucide="${s.icon}"></i>
            </div>
            <div class="service-details">
              <div class="service-name">${s.name}</div>
              <div class="service-meta">
                <div>Status: <span class="badge ${s.status === 'active' ? 'green' : 'gray'}">${s.status}</span></div>
                <div style="margin-top:4px">Risk: <span class="badge ${s.riskLevel === 'high' ? 'red' : s.riskLevel === 'medium' ? 'yellow' : 'green'}">${s.riskLevel}</span></div>
                <div style="margin-top:6px">Last accessed: ${formatTime(s.lastAccessed)}</div>
                <div style="margin-top:4px;font-size:0.75rem;color:var(--text-muted)">Data: ${s.dataAccessed.join(', ')}</div>
              </div>

              ${s.riskLevel === 'high' ? `
                <div style="margin-top:10px;padding:8px 12px;border-radius:8px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);font-size:0.78rem;color:var(--red)">
                  <i data-lucide="alert-triangle" style="width:14px;height:14px;display:inline;vertical-align:middle;margin-right:4px"></i>
                  ${s.riskExplanation}
                </div>
              ` : s.riskLevel === 'medium' ? `
                <div style="margin-top:10px;padding:8px 12px;border-radius:8px;background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.2);font-size:0.78rem;color:var(--yellow)">
                  <i data-lucide="info" style="width:14px;height:14px;display:inline;vertical-align:middle;margin-right:4px"></i>
                  ${s.riskExplanation}
                </div>
              ` : ''}

              <div class="service-actions">
                ${s.status === 'active' ? `
                  <button class="btn btn-danger btn-sm" onclick="disconnectService(${s.id}, this)">
                    <i data-lucide="unplug"></i> Disconnect
                  </button>
                ` : `
                  <button class="btn btn-primary btn-sm" onclick="connectService(${s.id})">
                    <i data-lucide="plug"></i> Connect
                  </button>
                `}
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  lucide.createIcons();
}

async function disconnectService(id, btnElement) {
  if (btnElement) {
    const cardWrap = btnElement.closest('.service-card-wrap');
    if (cardWrap) {
      cardWrap.classList.add('card-disconnecting');
    }
  }
  
  // Wait for animation to finish
  setTimeout(async () => {
    await api(`/api/services/${id}/disconnect`, { method: 'POST' });
    showToast('Service disconnected', 'warning');
    renderServices();
  }, 600);
}

async function connectService(id) {
  await api(`/api/services/${id}/connect`, { method: 'POST' });
  showToast('Service connected', 'success');
  renderServices();
}
