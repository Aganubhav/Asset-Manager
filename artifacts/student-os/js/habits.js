document.addEventListener('DOMContentLoaded', () => {
  let habits = ls.get('habits', []);
  const today = new Date().toISOString().split('T')[0];
  let currentView = 'daily';

  const EMOJIS = ['💻','📚','🏃‍♂️','💧','🧘‍♀️','📖','🍎','🛌','🎸','🎨'];

  document.getElementById('btn-add-habit').addEventListener('click', openHabitModal);
  document.getElementById('btn-save-habit').addEventListener('click', saveHabit);
  document.getElementById('habit-modal').addEventListener('click', (e) => {
    if (e.target.id === 'habit-modal') closeHabitModal();
  });

  // Setup icon picker
  const picker = document.getElementById('icon-picker');
  picker.innerHTML = EMOJIS.map(e => `
    <button class="btn" style="padding:10px; background:var(--bg-tertiary); font-size:1.2rem;" onclick="selectIcon('${e}', this)">${e}</button>
  `).join('');

  window.selectIcon = function(emoji, btnEl) {
    document.getElementById('h-icon').value = emoji;
    Array.from(picker.children).forEach(c => c.style.border = 'none');
    btnEl.style.border = '2px solid var(--accent)';
  };

  window.setHabitView = function(view) {
    currentView = view;
    document.getElementById('view-daily').classList.toggle('active', view === 'daily');
    document.getElementById('view-weekly').classList.toggle('active', view === 'weekly');
    document.getElementById('view-monthly').classList.toggle('active', view === 'monthly');
    render();
  };

  function openHabitModal() {
    document.getElementById('h-name').value = '';
    document.getElementById('h-icon').value = '💻';
    Array.from(picker.children).forEach(c => c.style.border = 'none');
    picker.children[0].style.border = '2px solid var(--accent)';
    document.getElementById('habit-modal').classList.add('open');
  }

  window.closeHabitModal = function() {
    document.getElementById('habit-modal').classList.remove('open');
  };

  function recalculateStreak(completedDates) {
    if (!completedDates || completedDates.length === 0) return 0;
    const sorted = [...new Set(completedDates)].sort().reverse();
    let streak = 0;
    let current = new Date(today);
    
    // Check if missed today, but maybe did yesterday
    const didToday = sorted.includes(today);
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const didYesterday = sorted.includes(yesterday);
    
    if (!didToday && !didYesterday) return 0;

    current = didToday ? new Date(today) : new Date(yesterday);

    while (true) {
      const dStr = current.toISOString().split('T')[0];
      if (sorted.includes(dStr)) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  function saveHabit() {
    const name = document.getElementById('h-name').value.trim();
    const icon = document.getElementById('h-icon').value;
    if (!name) return toast('Name required', 'error');

    habits.push({
      id: Date.now().toString(),
      name, icon, streak: 0, completedDates: [], createdAt: new Date().toISOString()
    });
    ls.set('habits', habits);
    closeHabitModal();
    logActivity('Added habit: ' + name);
    toast('Habit added', 'success');
    render();
  }

  window.deleteHabit = function(id) {
    if (confirm('Delete this habit?')) {
      habits = habits.filter(h => h.id !== id);
      ls.set('habits', habits);
      render();
    }
  };

  window.toggleHabit = function(id, dateOverride = null) {
    const targetDate = dateOverride || today;
    const h = habits.find(x => x.id === id);
    if (!h) return;
    if (!h.completedDates) h.completedDates = [];
    
    const idx = h.completedDates.indexOf(targetDate);
    if (idx > -1) {
      h.completedDates.splice(idx, 1);
    } else {
      h.completedDates.push(targetDate);
      if (targetDate === today) toast(`${h.name} completed!`, 'success');
    }
    h.streak = recalculateStreak(h.completedDates);
    ls.set('habits', habits);
    render();
  };

  function renderSummary() {
    const total = habits.length;
    const doneToday = habits.filter(h => (h.completedDates || []).includes(today)).length;
    const pct = total === 0 ? 0 : Math.round((doneToday / total) * 100);
    
    document.getElementById('habits-summary').innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h3 style="margin:0;">Today's Progress</h3>
        <span style="font-weight:700;">${doneToday} / ${total} Done</span>
      </div>
      <div style="height:8px; background:var(--bg-primary); border-radius:4px;">
        <div style="height:100%; width:${pct}%; background:var(--gradient-1); border-radius:4px; transition:width 0.5s;"></div>
      </div>
    `;
  }

  function renderDaily() {
    const container = document.getElementById('habits-container');
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    container.style.gap = '20px';
    
    if (habits.length === 0) return container.innerHTML = '<p>No habits added.</p>';

    container.innerHTML = habits.map(h => {
      h.streak = recalculateStreak(h.completedDates);
      const isDone = (h.completedDates || []).includes(today);
      
      // Last 7 days mini heatmap
      const dots = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
        const done = (h.completedDates || []).includes(d);
        dots.push(`<div style="width:12px; height:12px; border-radius:3px; background:${done ? 'var(--accent)' : 'var(--bg-tertiary)'};" title="${d}"></div>`);
      }

      return `
        <div class="glass-card" style="padding:20px; border-color:${isDone ? 'var(--accent)' : 'var(--border)'}; background:${isDone ? 'var(--accent-glow)' : 'var(--bg-glass)'};">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="font-size:2rem; background:var(--bg-tertiary); width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center;">${h.icon || '📌'}</div>
              <div>
                <h3 style="margin:0 0 4px 0;">${h.name}</h3>
                <div style="font-size:0.8rem; color:var(--text-muted);">🔥 ${h.streak} Day Streak</div>
              </div>
            </div>
            <button class="btn" style="background:${isDone ? 'var(--success)' : 'var(--bg-tertiary)'}; color:${isDone ? 'white' : 'var(--text-primary)'}; padding:6px 12px; border-radius:20px;" onclick="toggleHabit('${h.id}')">
              ${isDone ? '✓ Done' : 'Mark Done'}
            </button>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px;">
            <div style="display:flex; gap:4px;">${dots.join('')}</div>
            <button style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:0.8rem;" onclick="deleteHabit('${h.id}')">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderWeekly() {
    const container = document.getElementById('habits-container');
    container.style.display = 'block';
    
    if (habits.length === 0) return container.innerHTML = '<p>No habits added.</p>';

    const days = [];
    const dayLabels = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      days.push(d.toISOString().split('T')[0]);
      dayLabels.push(d.toLocaleDateString('en-US', {weekday:'short'}));
    }

    let html = `
      <div class="glass-card" style="overflow-x:auto;">
        <table style="width:100%; text-align:left; border-collapse:collapse;">
          <thead>
            <tr>
              <th style="padding:12px; border-bottom:1px solid var(--border);">Habit</th>
              ${dayLabels.map(l => `<th style="padding:12px; border-bottom:1px solid var(--border); text-align:center;">${l}</th>`).join('')}
              <th style="padding:12px; border-bottom:1px solid var(--border); text-align:right;">Consistency</th>
            </tr>
          </thead>
          <tbody>
    `;

    habits.forEach(h => {
      const doneDays = days.filter(d => (h.completedDates || []).includes(d)).length;
      const pct = Math.round((doneDays / 7) * 100);
      html += `<tr>
        <td style="padding:12px; border-bottom:1px solid var(--border); font-weight:600;">${h.icon} ${h.name}</td>
        ${days.map(d => {
          const done = (h.completedDates || []).includes(d);
          return `<td style="padding:12px; border-bottom:1px solid var(--border); text-align:center;">
            <button style="width:24px; height:24px; border-radius:6px; border:none; cursor:pointer; background:${done ? 'var(--accent)' : 'var(--bg-tertiary)'}; color:white;" onclick="toggleHabit('${h.id}', '${d}')">${done ? '✓' : ''}</button>
          </td>`;
        }).join('')}
        <td style="padding:12px; border-bottom:1px solid var(--border); text-align:right; font-weight:700; color:var(--accent);">${pct}%</td>
      </tr>`;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
  }

  function renderMonthly() {
    const container = document.getElementById('habits-container');
    container.style.display = 'grid';
    container.style.gridTemplateColumns = '1fr';
    container.style.gap = '20px';
    
    if (habits.length === 0) return container.innerHTML = '<p>No habits added.</p>';

    const days = [];
    for (let i = 29; i >= 0; i--) {
      days.push(new Date(Date.now() - i * 86400000).toISOString().split('T')[0]);
    }

    container.innerHTML = habits.map(h => {
      const doneDays = days.filter(d => (h.completedDates || []).includes(d)).length;
      const pct = Math.round((doneDays / 30) * 100);
      
      const cells = days.map(d => {
        const done = (h.completedDates || []).includes(d);
        return `<div style="aspect-ratio:1; border-radius:3px; background:${done ? 'var(--accent)' : 'var(--bg-tertiary)'};" title="${d}"></div>`;
      }).join('');

      return `
        <div class="glass-card" style="padding:20px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
            <h3 style="margin:0;">${h.icon} ${h.name}</h3>
            <span style="font-weight:700; color:var(--accent);">${pct}% Consistent</span>
          </div>
          <div style="display:grid; grid-template-columns:repeat(30, 1fr); gap:4px;">${cells}</div>
        </div>
      `;
    }).join('');
  }

  function render() {
    renderSummary();
    if (currentView === 'daily') renderDaily();
    else if (currentView === 'weekly') renderWeekly();
    else if (currentView === 'monthly') renderMonthly();
  }

  render();
});