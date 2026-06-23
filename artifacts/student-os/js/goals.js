document.addEventListener('DOMContentLoaded', () => {
  let goals = ls.get('goals', []);
  let editingId = null;

  document.getElementById('btn-add-goal').addEventListener('click', () => openGoalModal());
  document.getElementById('btn-save-goal').addEventListener('click', saveGoal);
  document.getElementById('goal-modal').addEventListener('click', (e) => {
    if (e.target.id === 'goal-modal') closeGoalModal();
  });

  window.openGoalModal = function(id = null) {
    editingId = id;
    document.getElementById('goal-modal-title').innerText = id ? 'Edit Goal' : 'New Goal';
    if (id) {
      const g = goals.find(x => x.id === id);
      document.getElementById('g-title').value = g.title || '';
      document.getElementById('g-desc').value = g.description || '';
      document.getElementById('g-category').value = g.category || 'Personal';
      document.getElementById('g-target').value = g.targetValue || '';
      document.getElementById('g-unit').value = g.unit || '';
      document.getElementById('g-deadline').value = g.deadline || '';
    } else {
      document.getElementById('g-title').value = '';
      document.getElementById('g-desc').value = '';
      document.getElementById('g-category').value = 'Coding';
      document.getElementById('g-target').value = '';
      document.getElementById('g-unit').value = '';
      document.getElementById('g-deadline').value = '';
    }
    document.getElementById('goal-modal').classList.add('open');
  };

  window.closeGoalModal = function() {
    document.getElementById('goal-modal').classList.remove('open');
  };

  function saveGoal() {
    const title = document.getElementById('g-title').value.trim();
    const targetValue = parseInt(document.getElementById('g-target').value, 10);
    
    if (!title || isNaN(targetValue) || targetValue <= 0) {
      return toast('Valid title and target value required', 'error');
    }

    const description = document.getElementById('g-desc').value.trim();
    const category = document.getElementById('g-category').value;
    const unit = document.getElementById('g-unit').value.trim();
    const deadline = document.getElementById('g-deadline').value;

    if (editingId) {
      const idx = goals.findIndex(g => g.id === editingId);
      if (idx > -1) {
        goals[idx] = { ...goals[idx], title, description, category, targetValue, unit, deadline };
        if (goals[idx].currentProgress >= targetValue && !goals[idx].completed) {
          goals[idx].completed = true;
          goals[idx].completedDate = new Date().toISOString().split('T')[0];
        }
      }
      toast('Goal updated', 'success');
      logActivity('Updated goal: ' + title);
    } else {
      goals.push({
        id: Date.now().toString(),
        title, description, category, targetValue, currentProgress: 0, unit, deadline,
        completed: false, completedDate: null, createdAt: new Date().toISOString()
      });
      toast('Goal created', 'success');
      logActivity('Created goal: ' + title);
    }
    ls.set('goals', goals);
    closeGoalModal();
    render();
  }

  window.deleteGoal = function(id) {
    if (confirm('Are you sure you want to delete this goal?')) {
      goals = goals.filter(g => g.id !== id);
      ls.set('goals', goals);
      toast('Goal deleted', 'info');
      logActivity('Deleted a goal');
      render();
    }
  };

  window.updateGoalProgress = function(id, amount) {
    const g = goals.find(x => x.id === id);
    if (!g) return;
    
    if (amount === 'custom') {
      const val = parseInt(prompt(`Enter amount to add to "${g.title}":`), 10);
      if (isNaN(val)) return;
      amount = val;
    }

    g.currentProgress = Math.min(g.targetValue, Math.max(0, g.currentProgress + amount));
    
    if (g.currentProgress >= g.targetValue && !g.completed) {
      g.completed = true;
      g.completedDate = new Date().toISOString().split('T')[0];
      toast('Goal Reached! 🎉', 'success');
      logActivity('Completed goal: ' + g.title);
      // Confetti flash could be handled by adding a class temporarily
      const card = document.getElementById('goal-card-' + id);
      if (card) {
        card.classList.add('goal-complete-anim');
        setTimeout(() => card.classList.remove('goal-complete-anim'), 600);
      }
    }
    ls.set('goals', goals);
    render();
  };

  function renderStats() {
    const total = goals.length;
    const completed = goals.filter(g => g.completed).length;
    const active = total - completed;
    
    let avgProgress = 0;
    if (total > 0) {
      const sum = goals.reduce((acc, g) => acc + (g.currentProgress / g.targetValue), 0);
      avgProgress = Math.round((sum / total) * 100);
    }

    let closest = null;
    let maxPct = -1;
    goals.filter(g => !g.completed).forEach(g => {
      const pct = g.currentProgress / g.targetValue;
      if (pct > maxPct) {
        maxPct = pct;
        closest = g;
      }
    });

    document.getElementById('goal-stats').innerHTML = `
      <div class="glass-card" style="padding:16px;">
        <div style="font-size:0.8rem; color:var(--text-muted);">Active Goals</div>
        <div style="font-size:1.5rem; font-weight:700;">${active}</div>
      </div>
      <div class="glass-card" style="padding:16px;">
        <div style="font-size:0.8rem; color:var(--text-muted);">Completed</div>
        <div style="font-size:1.5rem; font-weight:700; color:var(--success);">${completed}</div>
      </div>
      <div class="glass-card" style="padding:16px;">
        <div style="font-size:0.8rem; color:var(--text-muted);">Avg Completion</div>
        <div style="font-size:1.5rem; font-weight:700; color:var(--accent);">${avgProgress}%</div>
      </div>
      <div class="glass-card" style="padding:16px;">
        <div style="font-size:0.8rem; color:var(--text-muted);">Closest to Done</div>
        <div style="font-size:1.1rem; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          ${closest ? `${closest.title} (${Math.round(maxPct*100)}%)` : '-'}
        </div>
      </div>
    `;
  }

  function render() {
    renderStats();
    const container = document.getElementById('goals-container');
    const today = new Date().toISOString().split('T')[0];

    if (goals.length === 0) {
      container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted);">No goals yet. Set your first goal!</div>`;
      return;
    }

    container.innerHTML = goals.map(g => {
      const current = g.currentProgress || 0;
      const pct = Math.min(100, Math.round((current / g.targetValue) * 100));
      let deadlineStr = '';
      let deadlineColor = 'var(--text-muted)';
      if (g.deadline) {
        const diff = (new Date(g.deadline) - new Date(today)) / 86400000;
        if (diff < 0 && !g.completed) {
          deadlineStr = 'Overdue';
          deadlineColor = 'var(--danger)';
        } else if (diff === 0 && !g.completed) {
          deadlineStr = 'Due Today';
          deadlineColor = 'var(--warning)';
        } else {
          deadlineStr = `${diff} days left`;
        }
      }

      return `
        <div class="glass-card task-card ${g.completed ? 'completed' : ''}" id="goal-card-${g.id}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <span class="category-badge" style="background:var(--bg-tertiary);">${g.category || 'General'}</span>
            ${deadlineStr ? `<span style="font-size:0.75rem; color:${deadlineColor}; font-weight:600;">⏱ ${deadlineStr}</span>` : ''}
          </div>
          <h3 style="margin:0 0 4px 0; font-size:1.1rem;">${g.title}</h3>
          ${g.description ? `<p style="font-size:0.85rem; color:var(--text-secondary); margin:0 0 12px 0;">${g.description}</p>` : ''}
          
          <div style="display:flex; justify-content:space-between; margin-top:16px; font-size:0.85rem; font-weight:600;">
            <span>${current} / ${g.targetValue} ${g.unit || ''}</span>
            <span style="color:var(--accent);">${pct}%</span>
          </div>
          
          <div class="milestone-track">
            <div class="milestone-fill" style="width:${pct}%"></div>
            ${[25, 50, 75, 100].map(m => `<div class="milestone-dot ${pct >= m ? 'reached' : ''}" style="left:${m}%" title="${m}%"></div>`).join('')}
          </div>

          ${!g.completed ? `
            <div style="display:flex; gap:6px; margin-top:16px;">
              <button class="btn" style="flex:1; padding:6px; font-size:0.8rem; background:var(--bg-tertiary); color:var(--text-primary);" onclick="updateGoalProgress('${g.id}', 1)">+1</button>
              <button class="btn" style="flex:1; padding:6px; font-size:0.8rem; background:var(--bg-tertiary); color:var(--text-primary);" onclick="updateGoalProgress('${g.id}', 5)">+5</button>
              <button class="btn" style="flex:1; padding:6px; font-size:0.8rem; background:var(--bg-tertiary); color:var(--text-primary);" onclick="updateGoalProgress('${g.id}', 10)">+10</button>
              <button class="btn" style="flex:1; padding:6px; font-size:0.8rem; background:var(--bg-tertiary); color:var(--text-primary);" onclick="updateGoalProgress('${g.id}', 'custom')">+?</button>
            </div>
          ` : `<div style="margin-top:16px; text-align:center; color:var(--success); font-weight:600; padding:6px;">🎉 Goal Completed</div>`}

          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px; border-top:1px solid var(--border); padding-top:12px;">
            <button class="btn" style="padding:4px 10px; font-size:0.75rem; background:transparent; color:var(--text-secondary);" onclick="openGoalModal('${g.id}')">Edit</button>
            <button class="btn" style="padding:4px 10px; font-size:0.75rem; background:transparent; color:var(--danger);" onclick="deleteGoal('${g.id}')">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  }

  render();
});