// ═══════════════════════════════════════════════
//  LOGS.JS — Transparency Logs
// ═══════════════════════════════════════════════

let logsSearchTimeout = null;

async function renderLogs() {
  const logs = await api('/api/logs');
  renderLogsUI(logs);
}

function renderLogsUI(logs) {
  const categories = [...new Set(logs.map(l => l.category))].sort();

  mainContent.innerHTML = `
    <div class="page-header animate-in">
      <h1>Transparency Logs</h1>
      <p>Complete history of data access by apps</p>
    </div>

    <div class="card animate-in">
      <div class="logs-toolbar">
        <input type="text" class="search-input" id="logs-search"
          placeholder="Search by app or action…" />
        <select class="filter-select" id="logs-filter">
          <option value="all">All Categories</option>
          ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
      </div>

      <div style="overflow-x:auto">
        <table class="logs-table">
          <thead>
            <tr>
              <th>App</th>
              <th>Action</th>
              <th>Category</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody id="logs-tbody">
            ${logs.map(l => `
              <tr>
                <td style="font-weight:600">${l.app}</td>
                <td>${l.action}</td>
                <td><span class="badge blue">${l.category}</span></td>
                <td style="color:var(--text-muted)">${formatTime(l.timestamp)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      ${logs.length === 0 ? `
        <div class="empty-state">
          <i data-lucide="file-search"></i>
          <p>No logs found matching your search</p>
        </div>
      ` : ''}

      <div style="margin-top:16px;font-size:0.78rem;color:var(--text-muted)">
        Showing ${logs.length} entries
      </div>
    </div>
  `;

  lucide.createIcons();

  // Search handler
  document.getElementById('logs-search').addEventListener('input', e => {
    clearTimeout(logsSearchTimeout);
    logsSearchTimeout = setTimeout(() => filterLogs(), 300);
  });

  // Filter handler
  document.getElementById('logs-filter').addEventListener('change', () => filterLogs());
}

async function filterLogs() {
  const search = document.getElementById('logs-search').value;
  const category = document.getElementById('logs-filter').value;
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category !== 'all') params.set('category', category);
  const logs = await api(`/api/logs?${params.toString()}`);

  const tbody = document.getElementById('logs-tbody');
  if (tbody) {
    tbody.innerHTML = logs.map(l => `
      <tr>
        <td style="font-weight:600">${l.app}</td>
        <td>${l.action}</td>
        <td><span class="badge blue">${l.category}</span></td>
        <td style="color:var(--text-muted)">${formatTime(l.timestamp)}</td>
      </tr>
    `).join('');
  }
}
