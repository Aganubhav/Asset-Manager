document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('achievements-container');
  const summary = document.getElementById('achievement-summary');
  
  const ACHIEVEMENTS = [
    // Bronze
    { id: 'first_task', title: 'First Step', desc: 'Complete your first task', icon: '✅', tier: 'Bronze' },
    { id: 'first_goal', title: 'Goal Setter', desc: 'Create your first goal', icon: '🎯', tier: 'Bronze' },
    { id: 'first_pomodoro', title: 'Focus Initiate', desc: 'Complete 1 Pomodoro session', icon: '🍅', tier: 'Bronze' },
    { id: 'streak_3', title: 'Consistent', desc: 'Maintain a 3-day login streak', icon: '🔥', tier: 'Bronze' },
    
    // Silver
    { id: 'tasks_10', title: 'Task Master', desc: 'Complete 10 tasks', icon: '📋', tier: 'Silver' },
    { id: 'pomodoro_10', title: 'Deep Worker', desc: 'Complete 10 Pomodoro sessions', icon: '⏱️', tier: 'Silver' },
    { id: 'goal_completed', title: 'Goal Getter', desc: 'Complete your first goal', icon: '🏅', tier: 'Silver' },
    { id: 'streak_7', title: 'One Week Strong', desc: 'Maintain a 7-day streak', icon: '📅', tier: 'Silver' },

    // Gold
    { id: 'tasks_50', title: 'Productivity Machine', desc: 'Complete 50 tasks', icon: '⚡', tier: 'Gold' },
    { id: 'pomodoro_50', title: 'Zen Master', desc: 'Complete 50 Pomodoro sessions', icon: '🧠', tier: 'Gold' },
    { id: 'goals_5', title: 'Overachiever', desc: 'Complete 5 goals', icon: '🌟', tier: 'Gold' },
    { id: 'streak_30', title: 'Unstoppable', desc: 'Maintain a 30-day streak', icon: '🚀', tier: 'Gold' },

    // Platinum
    { id: 'tasks_100', title: 'Task Annihilator', desc: 'Complete 100 tasks', icon: '💯', tier: 'Platinum' },
    { id: 'pomodoro_100', title: 'Time Lord', desc: 'Complete 100 Pomodoro sessions', icon: '👑', tier: 'Platinum' },
    { id: 'goals_10', title: 'Legendary', desc: 'Complete 10 goals', icon: '🏆', tier: 'Platinum' },
    { id: 'streak_100', title: 'God Tier', desc: 'Maintain a 100-day streak', icon: '🌌', tier: 'Platinum' }
  ];

  let unlockedData = ls.get('achievements_data', {}); // { id: unlockDate }

  // Auto-check logic
  function checkUnlocks() {
    const tasks = ls.get('tasks', []);
    const pomodoros = ls.get('pomodoro_sessions', []);
    const goals = ls.get('goals', []);
    const streakInfo = ls.get('streak_info', { streak: 0 });
    
    const tasksCompleted = tasks.filter(t => t.completed).length;
    const pomosCompleted = pomodoros.length;
    const goalsCompleted = goals.filter(g => g.completed).length;
    const streak = streakInfo.best || streakInfo.streak;

    let newlyUnlocked = 0;
    const unlock = (id) => {
      if (!unlockedData[id]) {
        unlockedData[id] = new Date().toISOString();
        newlyUnlocked++;
        const a = ACHIEVEMENTS.find(x => x.id === id);
        if (a) toast(`Achievement Unlocked: ${a.title}! 🏆`, 'success');
      }
    };

    if (tasksCompleted >= 1) unlock('first_task');
    if (tasksCompleted >= 10) unlock('tasks_10');
    if (tasksCompleted >= 50) unlock('tasks_50');
    if (tasksCompleted >= 100) unlock('tasks_100');

    if (goals.length >= 1) unlock('first_goal');
    if (goalsCompleted >= 1) unlock('goal_completed');
    if (goalsCompleted >= 5) unlock('goals_5');
    if (goalsCompleted >= 10) unlock('goals_10');

    if (pomosCompleted >= 1) unlock('first_pomodoro');
    if (pomosCompleted >= 10) unlock('pomodoro_10');
    if (pomosCompleted >= 50) unlock('pomodoro_50');
    if (pomosCompleted >= 100) unlock('pomodoro_100');

    if (streak >= 3) unlock('streak_3');
    if (streak >= 7) unlock('streak_7');
    if (streak >= 30) unlock('streak_30');
    if (streak >= 100) unlock('streak_100');

    if (newlyUnlocked > 0) {
      ls.set('achievements_data', unlockedData);
    }
  }

  function render() {
    checkUnlocks();

    const unlockedCount = Object.keys(unlockedData).length;
    const total = ACHIEVEMENTS.length;
    
    summary.innerHTML = `
      <div class="glass-card" style="padding:16px; flex:1; min-width:200px;">
        <div style="font-size:0.8rem; color:var(--text-muted);">Total Unlocked</div>
        <div style="font-size:1.5rem; font-weight:700;">${unlockedCount} / ${total}</div>
        <div style="height:6px; background:var(--bg-tertiary); border-radius:3px; margin-top:8px;">
          <div style="height:100%; width:${(unlockedCount/total)*100}%; background:var(--gradient-1); border-radius:3px;"></div>
        </div>
      </div>
    `;

    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    
    container.innerHTML = tiers.map(tier => {
      const tierItems = ACHIEVEMENTS.filter(a => a.tier === tier);
      return `
        <div>
          <h2 style="margin:0 0 16px 0; font-size:1.2rem; display:flex; align-items:center; gap:8px;">
            <span style="width:12px; height:12px; border-radius:50%; background:var(--bg-tertiary);" class="rarity-${tier.toLowerCase()}"></span>
            ${tier} Tier
          </h2>
          <div class="card-grid">
            ${tierItems.map(a => {
              const unlockDate = unlockedData[a.id];
              const isUnlocked = !!unlockDate;
              return `
              <div class="glass-card rarity-${tier.toLowerCase()}" style="padding:20px; text-align:center; transition:var(--transition); ${isUnlocked ? '' : 'opacity:0.5; filter:grayscale(100%);'}">
                <div style="font-size:3rem; margin-bottom:12px; text-shadow:0 4px 12px rgba(0,0,0,0.1);">${isUnlocked ? a.icon : '🔒'}</div>
                <h3 style="margin:0 0 6px 0; font-size:1.1rem;">${isUnlocked ? a.title : '???'}</h3>
                <p style="font-size:0.85rem; color:var(--text-secondary); margin:0;">${isUnlocked ? a.desc : 'Keep working to unlock'}</p>
                ${isUnlocked ? `<div style="font-size:0.7rem; color:var(--text-muted); margin-top:12px;">Unlocked: ${new Date(unlockDate).toLocaleDateString()}</div>` : ''}
              </div>
            `}).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  render();
});