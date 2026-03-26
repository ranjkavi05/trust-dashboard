// ═══════════════════════════════════════════════
//  PERMISSIONS.JS — Active Permissions module
// ═══════════════════════════════════════════════

async function renderPermissions() {
  const permissions = await api('/api/permissions');

  mainContent.innerHTML = `
    <div class="page-header animate-in">
      <h1>Active Permissions</h1>
      <p>Manage what data apps can access</p>
    </div>

    <div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap" class="animate-in">
      <button class="btn btn-danger" id="revoke-all-btn">
        <i data-lucide="shield-off"></i> Revoke All Permissions
      </button>
    </div>

    <div class="grid-2">
      <div class="card animate-in">
        <div class="card-header">
          <div class="card-title"><i data-lucide="toggle-right"></i> Permissions</div>
          <span class="badge blue">${permissions.filter(p => p.enabled).length} Active</span>
        </div>
        <div id="permissions-list">
          ${permissions.map(p => permissionRow(p)).join('')}
        </div>
      </div>

      <div class="card animate-in">
        <div class="card-header">
          <div class="card-title"><i data-lucide="clock"></i> Time-Based Access</div>
        </div>
        <p style="color:var(--text-secondary);font-size:0.88rem;margin-bottom:16px">
          Set temporary access windows for sensitive permissions.
          After the time expires, the permission will automatically be disabled.
        </p>
        <div id="timed-access-list">
          ${permissions.filter(p => p.enabled).map(p => `
            <div class="toggle-wrap">
              <div class="toggle-info">
                <i data-lucide="${p.icon}"></i>
                <div>
                  <div class="toggle-name">${p.name}</div>
                  <div class="toggle-status active" id="timed-status-${p.id}">
                    ${p.timedAccess ? `Expires in ${p.timedAccess}` : 'Always on'}
                  </div>
                </div>
              </div>
              <select class="timed-access-select" data-id="${p.id}" onchange="setTimedAccess(${p.id}, this.value)">
                <option value="">Always</option>
                <option value="1 hour" ${p.timedAccess === '1 hour' ? 'selected' : ''}>1 Hour</option>
                <option value="4 hours" ${p.timedAccess === '4 hours' ? 'selected' : ''}>4 Hours</option>
                <option value="24 hours" ${p.timedAccess === '24 hours' ? 'selected' : ''}>24 Hours</option>
              </select>
            </div>
          `).join('') || '<div class="empty-state"><p>Enable permissions to set timed access</p></div>'}
        </div>
      </div>
    </div>
  `;

  lucide.createIcons();
  attachPermissionEvents();
}

function permissionRow(p) {
  return `
    <div class="toggle-wrap">
      <div class="toggle-info">
        <i data-lucide="${p.icon}"></i>
        <div>
          <div class="toggle-name">${p.name}</div>
          <div class="toggle-status ${p.enabled ? 'active' : 'disabled'}">
            ${p.enabled ? 'Active' : 'Disabled'}
          </div>
        </div>
      </div>
      <label class="switch">
        <input type="checkbox" ${p.enabled ? 'checked' : ''} data-id="${p.id}" class="perm-toggle" />
        <span class="slider"></span>
      </label>
    </div>
  `;
}

function attachPermissionEvents() {
  // Toggle switches
  document.querySelectorAll('.perm-toggle').forEach(input => {
    input.addEventListener('change', async function () {
      const id = this.dataset.id;
      const enabled = this.checked;
      await api(`/api/permissions/${id}`, {
        method: 'PUT',
        body: { enabled },
      });
      showToast(`Permission ${enabled ? 'enabled' : 'disabled'}`, enabled ? 'info' : 'warning');
      renderPermissions();
    });
  });

  // Revoke all
  document.getElementById('revoke-all-btn').addEventListener('click', async () => {
    await api('/api/permissions/revoke-all', { method: 'POST' });
    showToast('All permissions revoked', 'warning');
    renderPermissions();
  });
}

async function setTimedAccess(id, value) {
  await api(`/api/permissions/${id}`, {
    method: 'PUT',
    body: { timedAccess: value || null },
  });
  const statusEl = document.getElementById(`timed-status-${id}`);
  if (statusEl) {
    statusEl.textContent = value ? `Expires in ${value}` : 'Always on';
  }
  showToast(value ? `Access set for ${value}` : 'Timed access removed', 'info');
}
