// ═══════════════════════════════════════════════
//  PROFILE & SETTINGS — User Views
// ═══════════════════════════════════════════════

async function renderProfile() {
  const [scoreData, user] = await Promise.all([
    api('/api/privacy-score'),
    api('/api/user')
  ]);
  
  mainContent.innerHTML = `
    <div class="page-header animate-in">
      <h1>My Profile</h1>
      <p>View and edit your personal information</p>
    </div>
    
    <div class="card animate-in" style="max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; padding: 20px 0;">
        <div class="avatar" style="width: 120px; height: 120px; font-size: 3rem; margin: 0 auto 20px auto; box-shadow: 0 8px 24px rgba(59,130,246,0.3);">${user.initials.toUpperCase()}</div>
        <h2 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 4px;">${user.name}</h2>
        <p style="color: var(--text-muted); font-size: 1rem;">${user.email}</p>
        <div class="badge blue" style="margin-top: 16px;"><i data-lucide="check-circle" style="width:14px; height:14px; margin-right:4px;"></i> Pro User</div>
      </div>
      
      <div style="border-top: 1px solid var(--glass-border); padding: 24px 0 10px 0;">
        <div class="form-group" style="margin-bottom: 16px;">
          <label style="display:block; margin-bottom:8px; font-size:0.9rem; color:var(--text-muted);">Display Name</label>
          <input type="text" id="edit-name" class="input-modern" value="${user.name}" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--glass-border); background:var(--card-bg); color:var(--text-primary);">
        </div>
        <div class="form-group" style="margin-bottom: 16px;">
          <label style="display:block; margin-bottom:8px; font-size:0.9rem; color:var(--text-muted);">Email Address</label>
          <input type="email" id="edit-email" class="input-modern" value="${user.email}" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--glass-border); background:var(--card-bg); color:var(--text-primary);">
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom: 14px; font-size: 0.95rem; margin-top: 24px;">
          <span style="color: var(--text-muted);">Member Since</span>
          <strong style="color: var(--text-primary);">${user.joined}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom: 14px; font-size: 0.95rem;">
          <span style="color: var(--text-muted);">Account Role</span>
          <strong style="color: var(--text-primary);">${user.role}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; font-size: 0.95rem;">
          <span style="color: var(--text-muted);">Trust Score</span>
          <strong class="${scoreData.label.toLowerCase()} font-weight-bold">${scoreData.score}/100</strong>
        </div>
      </div>
      <div style="text-align: right; margin-top: 24px; border-top: 1px solid var(--glass-border); padding-top: 20px;">
        <button class="btn btn-primary" onclick="saveProfile()">Save Changes</button>
      </div>
    </div>
  `;
  lucide.createIcons();
  
  // Also attach tilt!
  if (typeof VanillaTilt !== 'undefined') {
    const el = document.querySelector('.avatar');
    if (el) VanillaTilt.init(el, { max: 15, speed: 400, "max-glare": 0.5, glare: true, scale: 1.05 });
  }
}

async function renderSettings() {
  mainContent.innerHTML = `
    <div class="page-header animate-in">
      <h1>Account Settings</h1>
      <p>Manage your security, notifications, and preferences</p>
    </div>
    
    <div class="grid-2" style="max-width: 900px; margin: 0 auto; gap: 24px;">
      <!-- Security Column -->
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div class="card animate-in">
          <div class="card-header">
            <div class="card-title"><i data-lucide="shield"></i> Security Details</div>
          </div>
          <div class="toggle-wrap">
            <div class="toggle-info">
              <div class="service-icon" style="background: rgba(34,197,94,0.15); color: var(--green);"><i data-lucide="smartphone"></i></div>
              <div>
                <div class="toggle-name">Two-Factor Auth</div>
                <div class="toggle-status text-muted" style="color:var(--text-muted)">Enabled (Authenticator App)</div>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="showToast('2FA settings opened')">Manage</button>
          </div>
          <div class="toggle-wrap">
            <div class="toggle-info">
              <div class="service-icon"><i data-lucide="key"></i></div>
              <div>
                <div class="toggle-name">Change Password</div>
                <div class="toggle-status text-muted" style="color:var(--text-muted)">Last changed 3 months ago</div>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="showToast('Password reset link sent!', 'success')">Update</button>
          </div>
          <div class="toggle-wrap">
            <div class="toggle-info">
              <div class="service-icon" style="color: var(--accent-purple)"><i data-lucide="monitor"></i></div>
              <div>
                <div class="toggle-name">Active Sessions</div>
                <div class="toggle-status text-muted" style="color:var(--text-muted)">2 devices logged in</div>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="showToast('Other sessions logged out!', 'info')">Revoke</button>
          </div>
        </div>
      </div>

      <!-- Notifications Column -->
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div class="card animate-in" style="animation-delay: 0.1s;">
          <div class="card-header">
            <div class="card-title"><i data-lucide="bell"></i> Notifications</div>
          </div>
          <div class="toggle-wrap">
            <div class="toggle-info">
              <div class="service-icon"><i data-lucide="mail"></i></div>
              <div>
                <div class="toggle-name">Email Digests</div>
                <div class="toggle-status active">Weekly security reports</div>
              </div>
            </div>
            <label class="switch">
              <input type="checkbox" checked onchange="showToast(this.checked ? 'Email digests enabled' : 'Email digests disabled', 'info')">
              <span class="slider"></span>
            </label>
          </div>
          <div class="toggle-wrap">
            <div class="toggle-info">
              <div class="service-icon"><i data-lucide="message-square"></i></div>
              <div>
                <div class="toggle-name">SMS Alerts</div>
                <div class="toggle-status disabled">Critical threats only</div>
              </div>
            </div>
            <label class="switch">
              <input type="checkbox" onchange="showToast(this.checked ? 'SMS alerts enabled' : 'SMS alerts disabled', 'info')">
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="card animate-in" style="border: 1px solid rgba(239, 68, 68, 0.3); animation-delay: 0.2s;">
           <div class="card-header">
             <div class="card-title" style="color: var(--red);"><i data-lucide="alert-triangle"></i> Danger Zone</div>
           </div>
           <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 16px;">Once you delete your account, there is no going back. Please be certain.</p>
           <button class="btn btn-danger" style="width: 100%" onclick="showToast('Account deletion requested. Check your email.', 'error')"><i data-lucide="trash-2"></i> Delete Account</button>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
}

window.saveProfile = async function() {
  const name = document.getElementById('edit-name').value;
  const email = document.getElementById('edit-email').value;
  
  if (!name.trim()) return showToast('Please enter a display name', 'error');
  
  try {
    const btn = document.querySelector('button[onclick="saveProfile()"]');
    if (btn) btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Saving...';
    lucide.createIcons();
    
    await api('/api/user', {
      method: 'PUT',
      body: { name, email }
    });
    
    showToast('Profile updated successfully!', 'success');
    if (window.refreshUserUI) await window.refreshUserUI();
    navigate('profile'); // Forces a re-render
  } catch (err) {
    showToast('Failed to save profile', 'error');
  }
};
