document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('tasks-container');
  const btnAdd = document.getElementById('btn-add-task');
  
  let tasks = ls.get('tasks', []);

  function render() {
    container.innerHTML = tasks.map(t => `
      <div class="glass-card" style="padding: 20px; text-decoration: ${t.completed ? 'line-through' : 'none'}; opacity: ${t.completed ? '0.7' : '1'}">
        <h3 style="margin-top:0">${t.title}</h3>
        <p style="color: var(--text-secondary)">${t.description || ''}</p>
        <button class="btn" style="padding: 5px 10px; font-size: 0.8rem;" onclick="toggleTask('${t.id}')">${t.completed ? 'Undo' : 'Complete'}</button>
        <button class="btn" style="padding: 5px 10px; font-size: 0.8rem; background: var(--danger)" onclick="deleteTask('${t.id}')">Delete</button>
      </div>
    `).join('') || '<p>No tasks yet.</p>';
  }

  window.toggleTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      ls.set('tasks', tasks);
      logActivity(task.completed ? 'Completed task' : 'Uncompleted task');
      render();
    }
  };

  window.deleteTask = (id) => {
    tasks = tasks.filter(t => t.id !== id);
    ls.set('tasks', tasks);
    logActivity('Deleted task');
    render();
  };

  btnAdd.addEventListener('click', () => {
    const title = prompt('Task Title:');
    if (title) {
      tasks.push({
        id: Date.now().toString(),
        title,
        description: '',
        completed: false,
        createdAt: new Date().toISOString()
      });
      ls.set('tasks', tasks);
      logActivity('Created task');
      render();
    }
  });

  render();
});