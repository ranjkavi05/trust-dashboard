// In-memory data store — seed data for the Trust Dashboard
// Can be swapped for MongoDB / Firebase in production

const { truncate } = require('fs/promises'); // wait no we don't need this

const user = {
  name: 'VJ Admin',
  email: 'vj@trustlens.hushh',
  initials: 'VJ',
  role: 'Administrator',
  joined: 'January 2026'
};

const permissions = [
  { id: 1, name: 'Location',    icon: 'map-pin',    enabled: true,  timedAccess: null },
  { id: 2, name: 'Camera',      icon: 'camera',     enabled: true,  timedAccess: null },
  { id: 3, name: 'Microphone',  icon: 'mic',        enabled: false, timedAccess: null },
  { id: 4, name: 'Contacts',    icon: 'users',      enabled: true,  timedAccess: null },
  { id: 5, name: 'Email',       icon: 'mail',       enabled: true,  timedAccess: null },
  { id: 6, name: 'Storage',     icon: 'hard-drive', enabled: false, timedAccess: null },
  { id: 7, name: 'Notifications', icon: 'bell',     enabled: true,  timedAccess: null },
];

const services = [
  {
    id: 1, name: 'Gmail',        icon: 'mail',        status: 'active',
    lastAccessed: '2026-03-25T09:15:00',
    dataAccessed: ['Email', 'Contacts'],
    riskLevel: null,
  },
  {
    id: 2, name: 'WhatsApp',     icon: 'message-circle', status: 'active',
    lastAccessed: '2026-03-25T08:42:00',
    dataAccessed: ['Contacts', 'Location', 'Microphone'],
    riskLevel: null,
  },
  {
    id: 3, name: 'Instagram',    icon: 'image',       status: 'active',
    lastAccessed: '2026-03-25T10:30:00',
    dataAccessed: ['Camera', 'Microphone', 'Location', 'Contacts'],
    riskLevel: null,
  },
  {
    id: 4, name: 'CRM App',      icon: 'briefcase',   status: 'active',
    lastAccessed: '2026-03-24T17:00:00',
    dataAccessed: ['Contacts', 'Email'],
    riskLevel: null,
  },
  {
    id: 5, name: 'Payment App',  icon: 'credit-card', status: 'inactive',
    lastAccessed: '2026-03-22T14:20:00',
    dataAccessed: ['Email'],
    riskLevel: null,
  },
  {
    id: 6, name: 'Maps',         icon: 'map',         status: 'active',
    lastAccessed: '2026-03-25T07:55:00',
    dataAccessed: ['Location'],
    riskLevel: null,
  },
  {
    id: 7, name: 'Fitness Tracker', icon: 'activity',  status: 'active',
    lastAccessed: '2026-03-25T06:00:00',
    dataAccessed: ['Location', 'Camera'],
    riskLevel: null,
  },
];

let alertIdCounter = 5;
const alerts = [
  { id: 1, type: 'warning',  message: 'Camera accessed by Instagram',        time: '2026-03-25T10:30:00', dismissed: false },
  { id: 2, type: 'danger',   message: 'High-risk app detected: Instagram',   time: '2026-03-25T10:28:00', dismissed: false },
  { id: 3, type: 'info',     message: 'New login detected from Chrome',      time: '2026-03-25T09:00:00', dismissed: false },
  { id: 4, type: 'warning',  message: 'WhatsApp accessed your location',     time: '2026-03-25T08:45:00', dismissed: true  },
];

const logs = [
  { id: 1,  app: 'Instagram',      action: 'Accessed camera',           category: 'Camera',    timestamp: '2026-03-25T10:30:00' },
  { id: 2,  app: 'Instagram',      action: 'Accessed contacts',         category: 'Contacts',  timestamp: '2026-03-25T10:29:00' },
  { id: 3,  app: 'WhatsApp',       action: 'Accessed location',         category: 'Location',  timestamp: '2026-03-25T08:45:00' },
  { id: 4,  app: 'WhatsApp',       action: 'Accessed microphone',       category: 'Microphone',timestamp: '2026-03-25T08:42:00' },
  { id: 5,  app: 'Gmail',          action: 'Accessed contacts',         category: 'Contacts',  timestamp: '2026-03-25T09:15:00' },
  { id: 6,  app: 'Gmail',          action: 'Read email data',           category: 'Email',     timestamp: '2026-03-25T09:10:00' },
  { id: 7,  app: 'CRM App',        action: 'Accessed contacts',         category: 'Contacts',  timestamp: '2026-03-24T17:00:00' },
  { id: 8,  app: 'Maps',           action: 'Accessed location',         category: 'Location',  timestamp: '2026-03-25T07:55:00' },
  { id: 9,  app: 'Fitness Tracker', action: 'Accessed location',        category: 'Location',  timestamp: '2026-03-25T06:00:00' },
  { id: 10, app: 'Fitness Tracker', action: 'Accessed camera',          category: 'Camera',    timestamp: '2026-03-25T06:05:00' },
  { id: 11, app: 'Payment App',    action: 'Read email data',           category: 'Email',     timestamp: '2026-03-22T14:20:00' },
  { id: 12, app: 'Instagram',      action: 'Accessed microphone',       category: 'Microphone',timestamp: '2026-03-25T10:31:00' },
];

// ── Risk calculation ────────────────────────────
function computeRiskLevel(dataAccessed) {
  const set = new Set(dataAccessed.map(d => d.toLowerCase()));
  if (set.has('camera') && set.has('microphone')) return 'high';
  if (set.has('location') && set.has('contacts')) return 'medium';
  if (set.size <= 1) return 'low';
  return 'medium';
}

function getRiskExplanation(level, dataAccessed) {
  if (level === 'high') return 'This app accesses camera & microphone — frequently used for surveillance.';
  if (level === 'medium') return `This app accesses sensitive data: ${dataAccessed.join(', ')}.`;
  return 'This app has limited data access — low privacy risk.';
}

// ── Privacy Score ───────────────────────────────
function computePrivacyScore() {
  let score = 100;
  const suggestions = [];

  // Deduct for active services
  const activeServices = services.filter(s => s.status === 'active');
  if (activeServices.length > 4) {
    score -= (activeServices.length - 4) * 5;
    suggestions.push('Disconnect unused apps to improve your score.');
  }

  // Deduct for high-risk services
  services.forEach(s => {
    const risk = computeRiskLevel(s.dataAccessed);
    if (risk === 'high') { score -= 15; suggestions.push(`Disconnect ${s.name} — it's high risk.`); }
    else if (risk === 'medium') { score -= 7; }
  });

  // Deduct for sensitive permissions enabled
  const sensitive = ['Camera', 'Microphone', 'Location'];
  permissions.forEach(p => {
    if (p.enabled && sensitive.includes(p.name)) {
      score -= 5;
      suggestions.push(`Disable ${p.name} access to improve your score.`);
    }
  });

  // Clamp
  score = Math.max(0, Math.min(100, score));

  let label = 'Safe';
  if (score < 50) label = 'Risky';
  else if (score < 80) label = 'Moderate';

  return { score, label, suggestions: [...new Set(suggestions)] };
}

// ── Chatbot ─────────────────────────────────────
function chatResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes('risky') || msg.includes('risk')) {
    const risky = services
      .filter(s => computeRiskLevel(s.dataAccessed) === 'high')
      .map(s => s.name);
    if (risky.length) return `⚠️ High-risk apps: ${risky.join(', ')}. They access camera & microphone which can be used for surveillance. Consider disconnecting them.`;
    return '✅ No high-risk apps detected right now!';
  }

  if (msg.includes('privacy score') || msg.includes('improve') || msg.includes('score')) {
    const { score, suggestions } = computePrivacyScore();
    return `Your privacy score is ${score}/100.\n\nSuggestions:\n• ${suggestions.slice(0, 3).join('\n• ')}`;
  }

  if (msg.includes('permission')) {
    const active = permissions.filter(p => p.enabled).map(p => p.name);
    return `Active permissions: ${active.join(', ')}. You can toggle them off in the Permissions section.`;
  }

  if (msg.includes('connected') || msg.includes('app') || msg.includes('service')) {
    const active = services.filter(s => s.status === 'active').map(s => s.name);
    return `Connected apps: ${active.join(', ')}. Head to Connected Services to manage them.`;
  }

  if (msg.includes('alert') || msg.includes('notification')) {
    const active = alerts.filter(a => !a.dismissed);
    return `You have ${active.length} active alert(s). Check the Alerts section for details.`;
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return '👋 Hey! I\'m your privacy assistant. Ask me about risky apps, your privacy score, permissions, or anything related to your data safety!';
  }

  return '🤖 I can help with:\n• "Which app is risky?"\n• "How to improve privacy score?"\n• "Show active permissions"\n• "List connected apps"\n• "Any alerts?"\n\nTry asking one of these!';
}

module.exports = {
  user,
  permissions,
  services,
  alerts,
  logs,
  alertIdCounter,
  computeRiskLevel,
  getRiskExplanation,
  computePrivacyScore,
  chatResponse,
};
