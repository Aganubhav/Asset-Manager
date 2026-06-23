document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('attendance-container');
  const btnAdd = document.getElementById('btn-add-subject');
  
  let subjects = ls.get('attendance', []);

  function render() {
    container.innerHTML = subjects.map(s => {
      const percent = s.total > 0 ? Math.round((s.attended / s.total) * 100) : 0;
      let color = 'var(--success)';
      if (percent < 75) color = 'var(--warning)';
      if (percent < 60) color = 'var(--danger)';

      return `
      <div class="glass-card" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="margin:0">${s.name}</h3>
          <span style="font-weight: bold; color: ${color}">${percent}%</span>
        </div>
        <p style="color: var(--text-secondary); margin-bottom: 15px;">Attended: ${s.attended} / ${s.total}</p>
        
        <div style="display: flex; gap: 10px;">
          <button class="btn" style="flex:1; padding: 5px;" onclick="addAttendance('${s.id}', true)">+ Present</button>
          <button class="btn" style="flex:1; padding: 5px; background: var(--bg-tertiary); color: var(--text-primary)" onclick="addAttendance('${s.id}', false)">+ Absent</button>
          <button class="btn" style="padding: 5px 10px; background: var(--danger);" onclick="deleteSubject('${s.id}')">X</button>
        </div>
      </div>
    `}).join('') || '<p>No subjects added yet.</p>';
  }

  window.addAttendance = (id, present) => {
    const subject = subjects.find(s => s.id === id);
    if (subject) {
      subject.total += 1;
      if (present) subject.attended += 1;
      ls.set('attendance', subjects);
      render();
    }
  };

  window.deleteSubject = (id) => {
    subjects = subjects.filter(s => s.id !== id);
    ls.set('attendance', subjects);
    render();
  };

  btnAdd.addEventListener('click', () => {
    const name = prompt('Subject Name:');
    if (name) {
      subjects.push({
        id: Date.now().toString(),
        name,
        total: 0,
        attended: 0
      });
      ls.set('attendance', subjects);
      render();
    }
  });

  render();
});