// ═══════════════════════════════════════════════
//  CHARTS.JS — Data Usage Visualization
// ═══════════════════════════════════════════════

async function renderDataUsage() {
  const data = await api('/api/data-usage');

  mainContent.innerHTML = `
    <div class="page-header animate-in">
      <h1>Data Usage</h1>
      <p>Visualize how your data is being accessed</p>
    </div>

    <div class="grid-2">
      <div class="card animate-in">
        <div class="card-header">
          <div class="card-title"><i data-lucide="pie-chart"></i> Usage by Category</div>
        </div>
        <div class="chart-container">
          <canvas id="usage-pie-chart"></canvas>
        </div>
      </div>

      <div class="card animate-in">
        <div class="card-header">
          <div class="card-title"><i data-lucide="bar-chart-3"></i> Access Frequency</div>
        </div>
        <div class="chart-container" style="max-width:100%">
          <canvas id="usage-bar-chart"></canvas>
        </div>
      </div>
    </div>

    <div class="card animate-in" style="margin-top:24px">
      <div class="card-header">
        <div class="card-title"><i data-lucide="clock"></i> Recent Activity Timeline</div>
      </div>
      <div class="timeline">
        ${data.timeline.map(t => `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <strong>${t.app}</strong> ${t.action}
              <div class="timeline-time">${formatTime(t.time)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  lucide.createIcons();

  // Pie chart
  const pieCtx = document.getElementById('usage-pie-chart');
  if (pieCtx && data.usage) {
    const labels = Object.keys(data.usage);
    const values = Object.values(data.usage);
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e', '#eab308', '#ef4444', '#f97316'];

    new Chart(pieCtx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        cutout: '62%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              padding: 16,
              font: { family: 'Inter', size: 12 },
              usePointStyle: true,
              pointStyleWidth: 8,
            },
          },
        },
        animation: {
          animateRotate: true,
          duration: 1200,
          easing: 'easeOutQuart',
        },
      },
    });
  }

  // Bar chart
  const barCtx = document.getElementById('usage-bar-chart');
  if (barCtx && data.usage) {
    const labels = Object.keys(data.usage);
    const values = Object.values(data.usage);

    new Chart(barCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Access Count',
          data: values,
          backgroundColor: [
            'rgba(59,130,246,0.7)',
            'rgba(139,92,246,0.7)',
            'rgba(6,182,212,0.7)',
            'rgba(34,197,94,0.7)',
            'rgba(234,179,8,0.7)',
            'rgba(239,68,68,0.7)',
          ],
          borderRadius: 8,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            ticks: { color: '#94a3b8', font: { family: 'Inter' } },
            grid: { display: false },
          },
          y: {
            ticks: { color: '#64748b', font: { family: 'Inter' }, stepSize: 1 },
            grid: { color: 'rgba(255,255,255,0.04)' },
          },
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart',
        },
      },
    });
  }
}
