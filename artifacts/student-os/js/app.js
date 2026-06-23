const ls = {
  get: (key, def = null) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : def;
    } catch (e) {
      return def;
    }
  },
  set: (key, val) => {
    localStorage.setItem(key, JSON.stringify(val));
  }
};

const quotes = [
  "The secret of getting ahead is getting started.",
  "It always seems impossible until it's done.",
  "Don't watch the clock; do what it does. Keep going.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Focus on being productive instead of busy."
];

function getMotivationalQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function toast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const el = document.createElement('div');
  el.className = `toast ${type}`;
  
  const colors = {
    success: 'var(--success)',
    error: 'var(--danger)',
    warning: 'var(--warning)',
    info: 'var(--info)'
  };
  
  el.style.borderLeftColor = colors[type] || colors.info;
  el.innerText = message;
  
  container.appendChild(el);
  
  setTimeout(() => {
    el.style.animation = 'fadeOut 0.3s forwards';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

function toggleTheme() {
  const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  ls.set('theme', theme);
}

function initTheme() {
  const theme = ls.get('theme', 'light');
  document.documentElement.setAttribute('data-theme', theme);
}

function updateStreak() {
  const today = new Date().toISOString().split('T')[0];
  let streakInfo = ls.get('streak_info', { streak: 0, lastDate: null, best: 0 });
  
  if (streakInfo.lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (streakInfo.lastDate === yesterday) {
      streakInfo.streak += 1;
    } else {
      streakInfo.streak = 1;
    }
    streakInfo.lastDate = today;
    if (streakInfo.streak > (streakInfo.best || 0)) {
      streakInfo.best = streakInfo.streak;
    }
    ls.set('streak_info', streakInfo);
  }
  
  const streakEl = document.getElementById('sidebar-streak');
  if (streakEl) {
    streakEl.innerText = `🔥 ${streakInfo.streak} Days`;
  }
}

function showSettings() {
  let modal = document.getElementById('settings-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal">
        <h2>Settings</h2>
        <div class="form-group">
          <button class="btn" onclick="exportData()" style="width: 100%; margin-bottom: 10px;">Export Data (JSON)</button>
        </div>
        <div class="form-group">
          <label>Import Data</label>
          <input type="file" id="import-file" accept=".json" onchange="importData(event)">
        </div>
        <div class="form-group">
          <button class="btn" onclick="resetData()" style="width: 100%; background: var(--danger);">Reset All Data</button>
        </div>
        <div style="text-align: right; margin-top: 20px;">
          <button class="btn" onclick="document.getElementById('settings-modal').classList.remove('open')">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.classList.add('open');
}

window.exportData = function() {
  const data = JSON.stringify(localStorage);
  const blob = new Blob([data], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `student-os-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  toast('Data exported successfully!', 'success');
};

window.importData = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      localStorage.clear();
      Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
      toast('Data imported successfully! Reloading...', 'success');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      toast('Invalid backup file.', 'error');
    }
  };
  reader.readAsText(file);
};

window.resetData = function() {
  if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
    localStorage.clear();
    toast('All data reset. Reloading...', 'info');
    setTimeout(() => window.location.reload(), 1500);
  }
};

function renderSidebar() {
  const sidebar = document.createElement('div');
  sidebar.className = 'sidebar';
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  
  sidebar.innerHTML = `
    <div class="sidebar-header">Student OS</div>
    <div class="nav-links">
      <a href="dashboard.html" class="nav-item ${currentPath === 'dashboard.html' ? 'active' : ''}">📊 Dashboard</a>
      <a href="tasks.html" class="nav-item ${currentPath === 'tasks.html' ? 'active' : ''}">✅ Tasks</a>
      <a href="notes.html" class="nav-item ${currentPath === 'notes.html' ? 'active' : ''}">📝 Notes</a>
      <a href="pomodoro.html" class="nav-item ${currentPath === 'pomodoro.html' ? 'active' : ''}">🍅 Pomodoro</a>
      <a href="planner.html" class="nav-item ${currentPath === 'planner.html' ? 'active' : ''}">📅 Planner</a>
      <a href="goals.html" class="nav-item ${currentPath === 'goals.html' ? 'active' : ''}">🎯 Goals</a>
      <a href="habits.html" class="nav-item ${currentPath === 'habits.html' ? 'active' : ''}">💪 Habits</a>
      <a href="analytics.html" class="nav-item ${currentPath === 'analytics.html' ? 'active' : ''}">📈 Analytics</a>
      <a href="achievements.html" class="nav-item ${currentPath === 'achievements.html' ? 'active' : ''}">🏆 Achievements</a>
    </div>
    <div class="sidebar-footer">
      <div id="sidebar-streak" style="margin-bottom: 10px;">🔥 0 Days</div>
      <button class="btn" style="width: 100%; margin-bottom: 5px;" onclick="toggleTheme()">Theme ☀️/🌙</button>
      <button class="btn" style="width: 100%; background: var(--bg-tertiary); color: var(--text-primary);" onclick="showSettings()">Settings</button>
    </div>
  `;
  
  document.body.prepend(sidebar);
}

function logActivity(action) {
  const log = ls.get('activity_log', []);
  log.unshift({ action, date: new Date().toISOString() });
  if (log.length > 20) log.pop();
  ls.set('activity_log', log);
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  
  // Don't render sidebar on landing page
  if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
    renderSidebar();
    updateStreak();
  }
});

// Expose globals
window.ls = ls;
window.toast = toast;
window.logActivity = logActivity;
window.toggleTheme = toggleTheme;
window.showSettings = showSettings;
