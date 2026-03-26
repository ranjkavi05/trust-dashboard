// ═══════════════════════════════════════════════
//  PRIVACY-SCORE.JS — Privacy Score page
// ═══════════════════════════════════════════════

async function renderPrivacyScore() {
  const data = await api('/api/privacy-score');

  const scoreColor = data.score >= 80 ? '#22c55e' : data.score >= 50 ? '#eab308' : '#ef4444';
  const scoreColorEnd = data.score >= 80 ? '#06b6d4' : data.score >= 50 ? '#f97316' : '#dc2626';
  const circumference = 2 * Math.PI * 85;
  const offset = circumference * (1 - data.score / 100);

  mainContent.innerHTML = `
    <div class="page-header animate-in">
      <h1>Privacy Score</h1>
      <p>Your overall privacy health and improvement tips</p>
    </div>

    <div class="grid-2">
      <div class="card animate-in">
        <div class="card-header">
          <div class="card-title"><i data-lucide="gauge"></i> Your Score</div>
        </div>
        <div class="score-ring-container" style="padding:20px 0">
          <div class="score-ring">
            <svg viewBox="0 0 200 200">
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:${scoreColor}" />
                  <stop offset="100%" style="stop-color:${scoreColorEnd}" />
                </linearGradient>
              </defs>
              <circle class="ring-bg" cx="100" cy="100" r="85" />
              <circle class="ring-fill" cx="100" cy="100" r="85"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${circumference}"
                id="score-ring-animated" />
            </svg>
            <div class="score-value">
              <div class="score-number" id="score-counter">0</div>
              <div class="score-label ${data.label.toLowerCase()}">${data.label}</div>
            </div>
          </div>
        </div>

        <div style="text-align:center;margin-top:12px;padding:12px;border-radius:var(--radius-sm);background:rgba(255,255,255,0.03)">
          ${data.score >= 80
            ? '<span style="color:var(--green)">🛡️ Your privacy is well protected!</span>'
            : data.score >= 50
              ? '<span style="color:var(--yellow)">⚠️ Room for improvement — check suggestions</span>'
              : '<span style="color:var(--red)">🚨 Your privacy is at risk! Take action now</span>'
          }
        </div>
      </div>

      <div class="card animate-in">
        <div class="card-header">
          <div class="card-title"><i data-lucide="lightbulb"></i> Suggestions</div>
        </div>
        ${data.suggestions.length ? `
          <ul class="suggestions-list">
            ${data.suggestions.map(s => `
              <li class="suggestion-item">
                <i data-lucide="arrow-right-circle"></i>
                <span>${s}</span>
              </li>
            `).join('')}
          </ul>
        ` : '<div class="empty-state"><p>No suggestions — your privacy is excellent! 🎉</p></div>'}
      </div>
    </div>
  `;

  lucide.createIcons();

  // Animate score ring and counter
  requestAnimationFrame(() => {
    const ring = document.getElementById('score-ring-animated');
    if (ring) {
      ring.style.strokeDashoffset = offset;
    }

    // Counter animation
    const counter = document.getElementById('score-counter');
    if (counter) {
      let current = 0;
      const target = data.score;
      const step = Math.max(1, Math.ceil(target / 60));
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        counter.textContent = current;
      }, 20);
    }
  });
}
