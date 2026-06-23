document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('goals-container');
  const btnAdd = document.getElementById('btn-add-goal');
  
  let goals = ls.get('goals', []);

  function render() {
    container.innerHTML = goals.map(g => {
      const percentage = Math.min(100, Math.round((g.current / g.target) * 100));
      return `
      <div class="glass-card" style="padding: 20px;">
        <h3 style="margin-top:0">${g.title}</h3>
        <p style="color: var(--text-secondary); margin-bottom: 15px;">Progress: ${g.current} / ${g.target} ${g.unit || ''}</p>
        
        <div style="width: 100%; background: var(--bg-tertiary); height: 8px; border-radius: 4px; margin-bottom: 15px;">
          <div style="width: ${percentage}%; background: var(--gradient-1); height: 100%; border-radius: 4px; transition: width 0.3s;"></div>
        </div>
        
        <div style="display: flex; gap: 10px;">
          <button class="btn" style="flex:1; padding: 5px;" onclick="updateGoal('${g.id}', 1)">+1</button>
          <button class="btn" style="padding: 5px 10px; background: var(--danger);" onclick="deleteGoal('${g.id}')">X</button>
        </div>
      </div>
    `}).join('') || '<p>No goals yet.</p>';
  }

  window.updateGoal = (id, amount) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      goal.current += amount;
      ls.set('goals', goals);
      render();
      if (goal.current >= goal.target) {
        toast('Goal reached! 🎉', 'success');
      }
    }
  };

  window.deleteGoal = (id) => {
    goals = goals.filter(g => g.id !== id);
    ls.set('goals', goals);
    render();
  };

  btnAdd.addEventListener('click', () => {
    const title = prompt('Goal Title:');
    const target = prompt('Target Number:');
    if (title && target && !isNaN(target)) {
      goals.push({
        id: Date.now().toString(),
        title,
        current: 0,
        target: parseInt(target),
        createdAt: new Date().toISOString()
      });
      ls.set('goals', goals);
      render();
    }
  });

  render();
});