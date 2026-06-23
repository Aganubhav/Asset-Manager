document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('achievements-container');
  
  const ACHIEVEMENTS = [
    { id: 'first_task', title: 'First Step', desc: 'Complete your first task', icon: '✅' },
    { id: 'streak_3', title: '3-Day Streak', desc: 'Maintain a 3-day login streak', icon: '🔥' },
    { id: 'pomodoro_10', title: 'Focus Initiate', desc: 'Complete 10 Pomodoro sessions', icon: '🍅' },
    { id: 'goal_1', title: 'Goal Getter', desc: 'Complete your first goal', icon: '🎖️' }
  ];

  const unlocked = ls.get('achievements', []); // array of IDs
  
  function render() {
    container.innerHTML = ACHIEVEMENTS.map(a => {
      const isUnlocked = unlocked.includes(a.id);
      return `
      <div class="glass-card" style="padding: 20px; text-align: center; opacity: ${isUnlocked ? '1' : '0.5'}; filter: ${isUnlocked ? 'none' : 'grayscale(100%)'}">
        <div style="font-size: 3rem; margin-bottom: 10px;">${isUnlocked ? a.icon : '🔒'}</div>
        <h3 style="margin: 0 0 5px 0">${isUnlocked ? a.title : '???'}</h3>
        <p style="font-size: 0.9rem; color: var(--text-secondary)">${isUnlocked ? a.desc : 'Keep working to unlock'}</p>
      </div>
    `}).join('');
  }

  // Auto-check some basic achievements
  const tasks = ls.get('tasks', []);
  if (tasks.some(t => t.completed) && !unlocked.includes('first_task')) {
    unlocked.push('first_task');
    ls.set('achievements', unlocked);
    toast('Achievement Unlocked: First Step!', 'success');
  }

  render();
});