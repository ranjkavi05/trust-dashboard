const express = require('express');
const path = require('path');
const store = require('./data/store');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ═══════════════════════════════════════════════
//  PERMISSIONS API
// ═══════════════════════════════════════════════
app.get('/api/permissions', (req, res) => {
  res.json(store.permissions);
});

app.put('/api/permissions/:id', (req, res) => {
  const perm = store.permissions.find(p => p.id === +req.params.id);
  if (!perm) return res.status(404).json({ error: 'Permission not found' });

  if (req.body.enabled !== undefined) perm.enabled = req.body.enabled;
  if (req.body.timedAccess !== undefined) perm.timedAccess = req.body.timedAccess;

  // Log the change
  store.logs.unshift({
    id: Date.now(),
    app: 'System',
    action: `${perm.name} ${perm.enabled ? 'enabled' : 'disabled'}`,
    category: perm.name,
    timestamp: new Date().toISOString(),
  });

  // Alert
  if (perm.enabled) {
    store.alerts.unshift({
      id: ++store.alertIdCounter,
      type: 'info',
      message: `${perm.name} permission enabled`,
      time: new Date().toISOString(),
      dismissed: false,
    });
  }

  res.json(perm);
});

app.post('/api/permissions/revoke-all', (req, res) => {
  store.permissions.forEach(p => {
    p.enabled = false;
    p.timedAccess = null;
  });
  store.logs.unshift({
    id: Date.now(),
    app: 'System',
    action: 'All permissions revoked',
    category: 'System',
    timestamp: new Date().toISOString(),
  });
  store.alerts.unshift({
    id: ++store.alertIdCounter,
    type: 'warning',
    message: 'All permissions have been revoked',
    time: new Date().toISOString(),
    dismissed: false,
  });
  res.json({ success: true, permissions: store.permissions });
});

// ═══════════════════════════════════════════════
//  CONNECTED SERVICES API
// ═══════════════════════════════════════════════
app.get('/api/services', (req, res) => {
  const enriched = store.services.map(s => ({
    ...s,
    riskLevel: store.computeRiskLevel(s.dataAccessed),
    riskExplanation: store.getRiskExplanation(
      store.computeRiskLevel(s.dataAccessed),
      s.dataAccessed
    ),
  }));
  res.json(enriched);
});

app.post('/api/services/:id/disconnect', (req, res) => {
  const svc = store.services.find(s => s.id === +req.params.id);
  if (!svc) return res.status(404).json({ error: 'Service not found' });
  svc.status = 'inactive';
  store.logs.unshift({
    id: Date.now(),
    app: svc.name,
    action: 'Disconnected',
    category: 'Service',
    timestamp: new Date().toISOString(),
  });
  store.alerts.unshift({
    id: ++store.alertIdCounter,
    type: 'info',
    message: `${svc.name} has been disconnected`,
    time: new Date().toISOString(),
    dismissed: false,
  });
  res.json(svc);
});

app.post('/api/services/:id/connect', (req, res) => {
  const svc = store.services.find(s => s.id === +req.params.id);
  if (!svc) return res.status(404).json({ error: 'Service not found' });
  svc.status = 'active';
  store.logs.unshift({
    id: Date.now(),
    app: svc.name,
    action: 'Connected',
    category: 'Service',
    timestamp: new Date().toISOString(),
  });
  res.json(svc);
});

// ═══════════════════════════════════════════════
//  RISK API
// ═══════════════════════════════════════════════
app.get('/api/risk', (req, res) => {
  const risks = store.services.map(s => ({
    serviceId: s.id,
    serviceName: s.name,
    riskLevel: store.computeRiskLevel(s.dataAccessed),
    explanation: store.getRiskExplanation(
      store.computeRiskLevel(s.dataAccessed),
      s.dataAccessed
    ),
  }));
  res.json(risks);
});

// ═══════════════════════════════════════════════
//  PRIVACY SCORE API
// ═══════════════════════════════════════════════
app.get('/api/privacy-score', (req, res) => {
  res.json(store.computePrivacyScore());
});

// ═══════════════════════════════════════════════
//  ALERTS API
// ═══════════════════════════════════════════════
app.get('/api/alerts', (req, res) => {
  res.json(store.alerts);
});

app.post('/api/alerts/dismiss/:id', (req, res) => {
  const alert = store.alerts.find(a => a.id === +req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  alert.dismissed = true;
  res.json(alert);
});

app.post('/api/alerts/dismiss-all', (req, res) => {
  store.alerts.forEach(a => (a.dismissed = true));
  res.json({ success: true });
});

// ═══════════════════════════════════════════════
//  LOGS API
// ═══════════════════════════════════════════════
app.get('/api/logs', (req, res) => {
  let result = [...store.logs];
  const { search, category } = req.query;
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      l => l.app.toLowerCase().includes(q) || l.action.toLowerCase().includes(q)
    );
  }
  if (category && category !== 'all') {
    result = result.filter(l => l.category.toLowerCase() === category.toLowerCase());
  }
  res.json(result);
});

// ═══════════════════════════════════════════════
//  DATA USAGE API
// ═══════════════════════════════════════════════
app.get('/api/data-usage', (req, res) => {
  const usage = {};
  store.logs.forEach(l => {
    usage[l.category] = (usage[l.category] || 0) + 1;
  });
  const timeline = store.logs.slice(0, 10).map(l => ({
    app: l.app,
    action: l.action,
    time: l.timestamp,
  }));
  res.json({ usage, timeline });
});

// ═══════════════════════════════════════════════
//  CHAT API
// ═══════════════════════════════════════════════
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });
  const reply = store.chatResponse(message);
  res.json({ reply });
});

// ═══════════════════════════════════════════════
//  USER PROFILE API
// ═══════════════════════════════════════════════
app.get('/api/user', (req, res) => {
  res.json(store.user);
});

app.put('/api/user', (req, res) => {
  if (req.body.name) {
    store.user.name = req.body.name;
    const parts = req.body.name.trim().split(/\s+/);
    store.user.initials = parts.length > 1 ? (parts[0][0] + parts[parts.length-1][0]) : (parts[0] ? parts[0][0].toUpperCase() : 'U');
  }
  if (req.body.email) store.user.email = req.body.email;
  res.json(store.user);
});

// ═══════════════════════════════════════════════
//  HACKATHON PRESENTATION API
// ═══════════════════════════════════════════════
app.post('/api/secure-all', (req, res) => {
  store.permissions.forEach(p => { p.enabled = false; p.timedAccess = null; });
  store.services.forEach(s => {
    const risk = store.computeRiskLevel(s.dataAccessed);
    if (risk === 'high' || risk === 'medium') s.status = 'inactive';
  });
  store.alerts.unshift({
    id: ++store.alertIdCounter,
    type: 'info',
    message: 'Privacy optimized. Dangerous apps disconnected.',
    time: new Date().toISOString(),
    dismissed: false,
  });
  // Return the updated privacy score so frontend can update it
  res.json({ success: true, score: store.computePrivacyScore() });
});

app.post('/api/demo/attack', (req, res) => {
  const spyApp = {
    id: 999, name: 'Unknown Spyware', icon: 'bug', status: 'active',
    lastAccessed: new Date().toISOString(),
    dataAccessed: ['Camera', 'Microphone', 'Location', 'Contacts']
  };
  const idx = store.services.findIndex(s => s.id === 999);
  if (idx > -1) store.services.splice(idx, 1);
  store.services.unshift(spyApp);

  store.permissions.forEach(p => { p.enabled = true; });

  store.alerts.unshift({
    id: ++store.alertIdCounter,
    type: 'danger',
    message: 'CRITICAL: Unknown Spyware accessed Camera and Location!',
    time: new Date().toISOString(),
    dismissed: false,
  });
  res.json({ success: true });
});

app.post('/api/demo/remove-attack', (req, res) => {
  const idx = store.services.findIndex(s => s.id === 999);
  if (idx > -1) store.services.splice(idx, 1);

  store.alerts.unshift({
    id: ++store.alertIdCounter,
    type: 'info',
    message: '✅ System is secure. No threats detected.',
    time: new Date().toISOString(),
    dismissed: false,
  });
  res.json({ success: true });
});

// ═══════════════════════════════════════════════
//  START
// ═══════════════════════════════════════════════
const os = require('os');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const IP = getLocalIPAddress();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  🛡️  Trust Dashboard running!
  
  Local:     http://localhost:${PORT}
  Network:   http://${IP}:${PORT}
  
  ✅ Accessible from any device on your network
  `);
});
