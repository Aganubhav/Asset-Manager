document.addEventListener('DOMContentLoaded', () => {
  const statsContainer = document.getElementById('dashboard-stats');
  const recentActivity = document.getElementById('recent-activity');

  const tasks = ls.get('tasks', []);
  const streakInfo = ls.get('streak_info', { streak: 0 });

  const pendingTasks = tasks.filter(t => !t.completed).length;
  const completedToday = tasks.filter(t => t.completed && new Date(t.createdAt).toDateString() === new Date().toDateString()).length;

  const stats = [
    { label: 'Pending Tasks', value: pendingTasks, gradient: 'var(--gradient-1)' },
    { label: 'Completed Today', value: completedToday, gradient: 'var(--gradient-2)' },
    { label: 'Current Streak', value: `${streakInfo.streak} 🔥`, gradient: 'var(--gradient-3)' },
  ];

  statsContainer.innerHTML = stats.map(s => `
    <div class="stat-card" style="background: ${s.gradient}">
      <h3>${s.label}</h3>
      <div class="value">${s.value}</div>
    </div>
  `).join('');

  const log = ls.get('activity_log', []);
  if (log.length === 0) {
    recentActivity.innerHTML = '<p>No recent activity</p>';
  } else {
    recentActivity.innerHTML = log.slice(0, 10).map(l => `
      <div style="padding: 10px; border-bottom: 1px solid var(--border)">
        <span>${l.action}</span>
        <span style="float:right; color: var(--text-muted); font-size: 0.8rem">${new Date(l.date).toLocaleString()}</span>
      </div>
    `).join('');
  }
});
