// ═══════════════════════════════════════════════
//  RISK.JS — AI Risk Detection display helpers
// ═══════════════════════════════════════════════

// Risk detection is integrated into the services page
// This module provides helper functions used globally

function getRiskBadgeHTML(level) {
  const colors = { high: 'red', medium: 'yellow', low: 'green' };
  const labels = { high: 'High Risk', medium: 'Medium', low: 'Safe' };
  return `<span class="badge ${colors[level] || 'gray'}">${labels[level] || level}</span>`;
}

function getRiskIcon(level) {
  if (level === 'high') return 'alert-triangle';
  if (level === 'medium') return 'alert-circle';
  return 'shield-check';
}
