document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('habits-container');
  const btnAdd = document.getElementById('btn-add-habit');
  
  let habits = ls.get('habits', []);
  const today = new Date().toISOString().split('T')[0];

  function render() {
    container.innerHTML = habits.map(h => {
      const isDone = h.completedDates && h.completedDates.includes(today);
      return `
      <div class="glass-card" style="padding: 20px; display: flex; justify-content: space-between; align-items: center; background: ${isDone ? 'var(--bg-tertiary)' : 'var(--bg-glass)'}">
        <div>
          <h3 style="margin: 0 0 5px 0">${h.name}</h3>
          <div style="font-size: 0.8rem; color: var(--text-muted)">Streak: ${h.streak || 0} 🔥</div>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn" style="background: ${isDone ? 'var(--success)' : 'var(--border)'}; color: ${isDone ? 'white' : 'var(--text-primary)'}" onclick="toggleHabit('${h.id}')">
            ${isDone ? 'Done' : 'Mark Done'}
          </button>
          <button class="btn" style="background: var(--danger); padding: 10px;" onclick="deleteHabit('${h.id}')">X</button>
        </div>
      </div>
    `}).join('') || '<p>No habits yet.</p>';
  }

  window.toggleHabit = (id) => {
    const habit = habits.find(h => h.id === id);
    if (habit) {
      if (!habit.completedDates) habit.completedDates = [];
      const idx = habit.completedDates.indexOf(today);
      if (idx > -1) {
        habit.completedDates.splice(idx, 1);
        habit.streak = Math.max(0, (habit.streak || 1) - 1);
      } else {
        habit.completedDates.push(today);
        habit.streak = (habit.streak || 0) + 1;
        toast('Habit marked as done!', 'success');
      }
      ls.set('habits', habits);
      render();
    }
  };

  window.deleteHabit = (id) => {
    habits = habits.filter(h => h.id !== id);
    ls.set('habits', habits);
    render();
  };

  btnAdd.addEventListener('click', () => {
    const name = prompt('Habit Name:');
    if (name) {
      habits.push({
        id: Date.now().toString(),
        name,
        streak: 0,
        completedDates: [],
        createdAt: new Date().toISOString()
      });
      ls.set('habits', habits);
      render();
    }
  });

  render();
});