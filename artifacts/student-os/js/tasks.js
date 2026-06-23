document.addEventListener('DOMContentLoaded', () => {
  let tasks = ls.get('tasks', []);
  let currentView = 'list';
  let editingId = null;

  const prioColors = { 'Critical': '#ef4444', 'High': '#f59e0b', 'Medium': '#3b82f6', 'Low': '#10b981' };
  const prioVal = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };

  // Inputs
  const searchInput = document.getElementById('task-search');
  const catSelect = document.getElementById('filter-category');
  const prioSelect = document.getElementById('filter-priority');
  const sortSelect = document.getElementById('sort-tasks');

  // Event Listeners for Filters
  searchInput.addEventListener('input', render);
  catSelect.addEventListener('change', render);
  prioSelect.addEventListener('change', render);
  sortSelect.addEventListener('change', render);

  // Setup drag drop events on columns
  document.querySelectorAll('.kanban-col').forEach(col => {
    col.addEventListener('dragover', e => {
      e.preventDefault();
      col.classList.add('drag-over');
    });
    col.addEventListener('dragleave', e => {
      col.classList.remove('drag-over');
    });
    col.addEventListener('drop', e => {
      e.preventDefault();
      col.classList.remove('drag-over');
      const id = e.dataTransfer.getData('text/plain');
      const status = col.getAttribute('data-status');
      updateTaskStatus(id, status);
    });
  });

  document.getElementById('btn-add-task').addEventListener('click', () => openTaskModal());
  document.getElementById('btn-save-task').addEventListener('click', saveTask);

  document.getElementById('task-modal').addEventListener('click', (e) => {
    if (e.target.id === 'task-modal') closeTaskModal();
  });

  window.setView = function(view) {
    currentView = view;
    document.getElementById('btn-list-view').classList.toggle('active', view === 'list');
    document.getElementById('btn-kanban-view').classList.toggle('active', view === 'kanban');
    document.getElementById('tasks-list-view').style.display = view === 'list' ? 'block' : 'none';
    document.getElementById('tasks-kanban-view').style.display = view === 'kanban' ? 'block' : 'none';
    render();
  };

  window.openTaskModal = function(id = null) {
    editingId = id;
    document.getElementById('modal-title').innerText = id ? 'Edit Task' : 'New Task';
    if (id) {
      const t = tasks.find(x => x.id === id);
      document.getElementById('t-title').value = t.title || '';
      document.getElementById('t-desc').value = t.description || '';
      document.getElementById('t-category').value = t.category || 'Personal';
      document.getElementById('t-priority').value = t.priority || 'Medium';
      document.getElementById('t-deadline').value = t.deadline || '';
      document.getElementById('t-estTime').value = t.estTime || '';
      document.getElementById('t-status').value = t.status || 'Not Started';
    } else {
      document.getElementById('t-title').value = '';
      document.getElementById('t-desc').value = '';
      document.getElementById('t-category').value = 'Personal';
      document.getElementById('t-priority').value = 'Medium';
      document.getElementById('t-deadline').value = '';
      document.getElementById('t-estTime').value = '';
      document.getElementById('t-status').value = 'Not Started';
    }
    document.getElementById('task-modal').classList.add('open');
  };

  window.closeTaskModal = function() {
    document.getElementById('task-modal').classList.remove('open');
  };

  function saveTask() {
    const title = document.getElementById('t-title').value.trim();
    if (!title) return toast('Task title is required', 'error');

    const desc = document.getElementById('t-desc').value.trim();
    const category = document.getElementById('t-category').value;
    const priority = document.getElementById('t-priority').value;
    const deadline = document.getElementById('t-deadline').value;
    const estTime = document.getElementById('t-estTime').value;
    const status = document.getElementById('t-status').value;
    const completed = status === 'Completed';
    
    if (editingId) {
      const idx = tasks.findIndex(x => x.id === editingId);
      if (idx > -1) {
        tasks[idx] = {
          ...tasks[idx],
          title, description: desc, category, priority, deadline, estTime, status, completed,
          completedDate: completed && !tasks[idx].completed ? new Date().toISOString().split('T')[0] : tasks[idx].completedDate
        };
      }
      toast('Task updated', 'success');
      logActivity('Updated task: ' + title);
    } else {
      tasks.push({
        id: Date.now().toString(),
        title, description: desc, category, priority, deadline, estTime, status, completed,
        completedDate: completed ? new Date().toISOString().split('T')[0] : null,
        createdAt: new Date().toISOString()
      });
      toast('Task created', 'success');
      logActivity('Created task: ' + title);
    }
    ls.set('tasks', tasks);
    closeTaskModal();
    render();
  }

  window.deleteTask = function(id) {
    if (confirm('Are you sure you want to delete this task?')) {
      tasks = tasks.filter(t => t.id !== id);
      ls.set('tasks', tasks);
      toast('Task deleted', 'info');
      logActivity('Deleted a task');
      render();
    }
  };

  window.toggleComplete = function(id) {
    const t = tasks.find(x => x.id === id);
    if (t) {
      t.completed = !t.completed;
      t.status = t.completed ? 'Completed' : 'Not Started';
      t.completedDate = t.completed ? new Date().toISOString().split('T')[0] : null;
      ls.set('tasks', tasks);
      logActivity(t.completed ? 'Completed task: ' + t.title : 'Uncompleted task: ' + t.title);
      render();
    }
  };

  function updateTaskStatus(id, status) {
    const t = tasks.find(x => x.id === id);
    if (t && t.status !== status) {
      t.status = status;
      t.completed = status === 'Completed';
      t.completedDate = t.completed ? new Date().toISOString().split('T')[0] : null;
      ls.set('tasks', tasks);
      logActivity(`Moved task "${t.title}" to ${status}`);
      render();
    }
  }

  function getFilteredTasks() {
    let filtered = tasks;
    const q = searchInput.value.toLowerCase();
    if (q) filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q));
    
    const cat = catSelect.value;
    if (cat) filtered = filtered.filter(t => t.category === cat);
    
    const prio = prioSelect.value;
    if (prio) filtered = filtered.filter(t => t.priority === prio);

    const sort = sortSelect.value;
    filtered.sort((a, b) => {
      if (sort === 'priority') return prioVal[b.priority] - prioVal[a.priority];
      if (sort === 'deadline') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return filtered;
  }

  function renderStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const today = new Date().toISOString().split('T')[0];
    const overdue = tasks.filter(t => !t.completed && t.deadline && t.deadline < today).length;

    document.getElementById('task-stats').innerHTML = `
      <div class="glass-card" style="padding:16px;">
        <div style="font-size:0.8rem; color:var(--text-muted);">Total Tasks</div>
        <div style="font-size:1.5rem; font-weight:700;">${total}</div>
      </div>
      <div class="glass-card" style="padding:16px;">
        <div style="font-size:0.8rem; color:var(--text-muted);">Completed</div>
        <div style="font-size:1.5rem; font-weight:700; color:var(--success);">${completed}</div>
      </div>
      <div class="glass-card" style="padding:16px;">
        <div style="font-size:0.8rem; color:var(--text-muted);">Pending</div>
        <div style="font-size:1.5rem; font-weight:700;">${pending}</div>
      </div>
      <div class="glass-card" style="padding:16px; border-color:${overdue > 0 ? 'var(--danger)' : 'var(--border)'};">
        <div style="font-size:0.8rem; color:var(--text-muted);">Overdue</div>
        <div style="font-size:1.5rem; font-weight:700; color:${overdue > 0 ? 'var(--danger)' : 'inherit'};">${overdue}</div>
      </div>
    `;
  }

  function createTaskCardHTML(t, isKanban) {
    const color = prioColors[t.priority] || 'gray';
    const isOverdue = !t.completed && t.deadline && t.deadline < new Date().toISOString().split('T')[0];
    const borderStyle = isOverdue ? 'border-color: var(--danger);' : '';
    
    return `
      <div class="task-card ${t.completed ? 'completed' : ''}" style="${borderStyle}" draggable="${isKanban ? 'true' : 'false'}" ondragstart="event.dataTransfer.setData('text/plain', '${t.id}'); this.classList.add('dragging')" ondragend="this.classList.remove('dragging')">
        <div class="priority-stripe" style="background: ${color};"></div>
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <h3 style="margin:0 0 8px 0; font-size:1rem;">${t.title}</h3>
          ${!isKanban ? `<button class="btn" style="padding:4px 8px; font-size:0.75rem; background: ${t.completed ? 'var(--success)' : 'var(--bg-tertiary)'}; color: ${t.completed ? 'white' : 'var(--text-primary)'}" onclick="toggleComplete('${t.id}')">${t.completed ? 'Done' : 'Complete'}</button>` : ''}
        </div>
        ${t.description ? `<p style="font-size:0.85rem; color:var(--text-secondary); margin:0 0 12px 0;">${t.description}</p>` : ''}
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px;">
          ${t.category ? `<span class="category-badge" style="background:var(--bg-tertiary);">${t.category}</span>` : ''}
          ${t.priority ? `<span class="priority-badge" style="background:${color}22; color:${color};">${t.priority}</span>` : ''}
          ${t.deadline ? `<span class="priority-badge" style="background:${isOverdue ? 'var(--danger)22' : 'var(--bg-tertiary)'}; color:${isOverdue ? 'var(--danger)' : 'var(--text-muted)'};">🗓 ${t.deadline}</span>` : ''}
          ${t.estTime ? `<span class="priority-badge" style="background:var(--bg-tertiary); color:var(--text-muted);">⏱ ${t.estTime}m</span>` : ''}
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button class="btn" style="padding:4px 10px; font-size:0.75rem; background:var(--bg-tertiary); color:var(--text-primary);" onclick="openTaskModal('${t.id}')">Edit</button>
          <button class="btn" style="padding:4px 10px; font-size:0.75rem; background:var(--danger);" onclick="deleteTask('${t.id}')">Delete</button>
        </div>
      </div>
    `;
  }

  function renderList(filtered) {
    const container = document.getElementById('tasks-container');
    if (filtered.length === 0) {
      container.innerHTML = `<div class="glass-card" style="padding:40px; text-align:center; color:var(--text-muted);">No tasks found.</div>`;
      return;
    }
    container.innerHTML = filtered.map(t => createTaskCardHTML(t, false)).join('');
  }

  function renderKanban(filtered) {
    const cols = {
      'Not Started': document.getElementById('cards-not-started'),
      'In Progress': document.getElementById('cards-in-progress'),
      'Completed': document.getElementById('cards-completed')
    };
    
    Object.values(cols).forEach(c => c.innerHTML = '');
    
    let counts = { 'Not Started': 0, 'In Progress': 0, 'Completed': 0 };

    filtered.forEach(t => {
      const status = t.status || 'Not Started';
      if (cols[status]) {
        cols[status].innerHTML += createTaskCardHTML(t, true);
        counts[status]++;
      }
    });

    document.getElementById('count-not-started').innerText = counts['Not Started'];
    document.getElementById('count-in-progress').innerText = counts['In Progress'];
    document.getElementById('count-completed').innerText = counts['Completed'];
  }

  function render() {
    renderStats();
    const filtered = getFilteredTasks();
    if (currentView === 'list') {
      renderList(filtered);
    } else {
      renderKanban(filtered);
    }
  }

  render();
});