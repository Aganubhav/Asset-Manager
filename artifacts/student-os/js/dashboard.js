document.addEventListener('DOMContentLoaded', () => {
  // Show current date
  document.getElementById('date-display').textContent = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  const today = new Date().toISOString().split('T')[0];
  const tasks = ls.get('tasks', []);
  const goals = ls.get('goals', []);
  const habits = ls.get('habits', []);
  const pomodoros = ls.get('pomodoro_sessions', []);
  const streakInfo = ls.get('streak_info', { streak: 0, best: 0 });

  // Today's data
  const completedToday = tasks.filter(t => t.completed && t.completedDate === today).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const habitsToday = habits.filter(h => h.completedDates && h.completedDates.includes(today)).length;
  const pomodorosToday = pomodoros.filter(p => p.completedAt && p.completedAt.startsWith(today)).length;
  
  // Goals progress
  const activeGoals = goals.filter(g => !g.completed);
  const goalProgress = activeGoals.length > 0 ? Math.round(activeGoals.reduce((sum, g) => sum + Math.min(100, (g.current / g.target) * 100), 0) / activeGoals.length) : 0;

  // Productivity Score (0-100)
  const taskScore = tasks.length > 0 ? Math.min(30, (completedToday / Math.max(1, tasks.length)) * 30) : 0;
  const habitScore = habits.length > 0 ? Math.min(25, (habitsToday / habits.length) * 25) : 0;
  const pomodoroScore = Math.min(20, pomodorosToday * 4);
  const goalScore = Math.min(15, goalProgress * 0.15);
  const streakScore = Math.min(10, streakInfo.streak);
  const score = Math.round(taskScore + habitScore + pomodoroScore + goalScore + streakScore);

  // Score label
  let scoreLabel, scoreClass;
  if (score <= 40) { scoreLabel = 'Needs Improvement'; scoreClass = 'score-needs'; }
  else if (score <= 70) { scoreLabel = 'Good'; scoreClass = 'score-good'; }
  else if (score <= 90) { scoreLabel = 'Excellent'; scoreClass = 'score-excellent'; }
  else { scoreLabel = 'Productivity Beast 🔥'; scoreClass = 'score-beast'; }

  // Productivity Score Card with SVG ring
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  document.getElementById('score-card').innerHTML = `
    <h3 style="margin:0 0 16px 0; color:var(--text-muted); font-size:0.9rem; text-transform:uppercase; letter-spacing:.05em">Today's Score</h3>
    <svg width="140" height="140" style="margin:0 auto; display:block;">
      <circle cx="70" cy="70" r="54" fill="none" stroke="var(--bg-tertiary)" stroke-width="10"/>
      <circle cx="70" cy="70" r="54" fill="none" stroke="url(#scoreGrad)" stroke-width="10"
        stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"
        transform="rotate(-90 70 70)" id="score-ring"/>
      <defs>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#6b5ef5"/>
          <stop offset="100%" stop-color="#a78bfa"/>
        </linearGradient>
      </defs>
      <text x="70" y="65" text-anchor="middle" font-size="28" font-weight="700" fill="var(--text-primary)">${score}</text>
      <text x="70" y="85" text-anchor="middle" font-size="12" fill="var(--text-muted)">out of 100</text>
    </svg>
    <span class="score-badge ${scoreClass}" style="margin-top:12px; display:inline-block;">${scoreLabel}</span>
  `;
  // Animate ring
  setTimeout(() => {
    const ring = document.getElementById('score-ring');
    if (ring) ring.style.strokeDashoffset = offset;
  }, 100);

  // Today's Progress Card
  const totalHabits = habits.length;
  document.getElementById('today-progress').innerHTML = `
    <h3 style="margin:0 0 20px 0">Today's Progress</h3>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
      ${renderProgressItem('Tasks Done', completedToday, completedToday + pendingTasks, 'var(--gradient-1)')}
      ${renderProgressItem('Habits Done', habitsToday, totalHabits || 1, 'var(--gradient-2)')}
      ${renderProgressItem('Focus Sessions', pomodorosToday, 8, 'var(--gradient-3)')}
      ${renderProgressItem('Goals Progress', goalProgress, 100, 'var(--gradient-4)')}
    </div>
  `;

  function renderProgressItem(label, val, max, gradient) {
    const pct = Math.round((val / Math.max(1, max)) * 100);
    return `
      <div style="padding:16px; background:var(--bg-tertiary); border-radius:var(--radius);">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span style="font-size:0.85rem; color:var(--text-muted);">${label}</span>
          <span style="font-weight:600;">${val}${label.includes('Progress') ? '%' : '/' + max}</span>
        </div>
        <div style="height:6px; background:var(--border); border-radius:3px;">
          <div style="height:100%; width:${pct}%; background:${gradient}; border-radius:3px; transition:width 1s ease;"></div>
        </div>
      </div>
    `;
  }

  // Stat Cards
  const focusHoursTotal = Math.round((pomodoros.reduce((s, p) => s + (p.duration || 25), 0)) / 60 * 10) / 10;
  const completedGoals = goals.filter(g => g.completed).length;
  
  const stats = [
    { label: 'Current Streak', value: `${streakInfo.streak} 🔥`, sub: `Best: ${streakInfo.best || streakInfo.streak}`, gradient: 'var(--gradient-3)' },
    { label: 'Total Focus Hours', value: focusHoursTotal + 'h', sub: `${pomodorosToday} sessions today`, gradient: 'var(--gradient-1)' },
    { label: 'Goals Active', value: activeGoals.length, sub: `${completedGoals} completed`, gradient: 'var(--gradient-2)' },
    { label: 'Tasks Pending', value: pendingTasks, sub: `${completedToday} done today`, gradient: 'var(--gradient-4)' },
  ];

  document.getElementById('dashboard-stats').innerHTML = stats.map(s => `
    <div class="stat-card" style="background:${s.gradient}">
      <div>
        <h3 style="margin:0; font-size:0.85rem; opacity:0.85;">${s.label}</h3>
        <div class="value" style="font-size:2rem; font-weight:800; margin:8px 0 4px 0;">${s.value}</div>
        <div style="font-size:0.8rem; opacity:0.8;">${s.sub}</div>
      </div>
    </div>
  `).join('');

  // Weekly Grid — last 7 days tasks + sessions
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const weekGrid = document.getElementById('week-grid');
  const weekData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dStr = d.toISOString().split('T')[0];
    const dayTasks = tasks.filter(t => t.completedDate === dStr).length;
    const daySessions = pomodoros.filter(p => p.completedAt && p.completedAt.startsWith(dStr)).length;
    const dayHabits = habits.filter(h => h.completedDates && h.completedDates.includes(dStr)).length;
    const isToday = i === 0;
    weekData.push({ label: days[d.getDay()], tasks: dayTasks, sessions: daySessions, habits: dayHabits, isToday });
  }
  const maxVal = Math.max(1, ...weekData.map(d => d.tasks + d.sessions));
  weekGrid.innerHTML = weekData.map(d => {
    const pct = Math.round(((d.tasks + d.sessions) / maxVal) * 100);
    return `
      <div class="week-day ${d.isToday ? 'today' : ''}">
        <div class="week-day-label">${d.label}</div>
        <div class="week-day-bar">
          <div class="week-day-fill" style="height:${pct}%;"></div>
        </div>
        <div style="font-size:0.7rem; color:var(--text-muted); margin-top:6px;">${d.tasks}t ${d.sessions}s</div>
      </div>
    `;
  }).join('');

  // Monthly Stats
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthTasks = tasks.filter(t => t.completed && t.completedDate && t.completedDate.startsWith(thisMonth)).length;
  const monthSessions = pomodoros.filter(p => p.completedAt && p.completedAt.startsWith(thisMonth)).length;
  const monthHours = Math.round(monthSessions * 25 / 60 * 10) / 10;
  document.getElementById('monthly-stats').innerHTML = `
    <h3 style="margin:0 0 16px 0;">This Month</h3>
    ${[
      { label: 'Tasks Completed', val: monthTasks, icon: '✅' },
      { label: 'Focus Hours', val: monthHours + 'h', icon: '⏱️' },
      { label: 'Goals Achieved', val: completedGoals, icon: '🎯' },
      { label: 'Best Streak', val: (streakInfo.best || streakInfo.streak) + ' days', icon: '🔥' },
    ].map(s => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--border);">
        <span style="color:var(--text-secondary);">${s.icon} ${s.label}</span>
        <span style="font-weight:700; font-size:1.1rem;">${s.val}</span>
      </div>
    `).join('')}
  `;

  // Recent Activity
  const log = ls.get('activity_log', []);
  document.getElementById('recent-activity').innerHTML = `
    <h3 style="margin:0 0 16px 0;">Recent Activity</h3>
    ${log.length === 0 ? '<p style="color:var(--text-muted);">No activity yet. Get started!</p>' :
      log.slice(0, 8).map(l => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border);">
          <span style="font-size:0.9rem;">${l.action}</span>
          <span style="font-size:0.75rem; color:var(--text-muted);">${new Date(l.date).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
        </div>
      `).join('')}
  `;

  // Quote
  window.refreshQuote = function() {
    document.getElementById('quote-text').textContent = getMotivationalQuote();
  };
  window.refreshQuote();

  // Quick actions
  document.getElementById('quick-actions').innerHTML = `
    <a href="tasks.html" class="btn" style="font-size:0.85rem; padding:8px 16px;">+ Task</a>
    <a href="pomodoro.html" class="btn" style="font-size:0.85rem; padding:8px 16px; background:var(--gradient-3);">⏱ Focus</a>
    <a href="goals.html" class="btn" style="font-size:0.85rem; padding:8px 16px; background:var(--gradient-2);">🎯 Goal</a>
  `;
});