document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('planner-container');
  const btnAdd = document.getElementById('btn-add-slot');
  
  let slots = ls.get('planner_slots', []);

  function render() {
    if (slots.length === 0) {
      container.innerHTML = '<p>No planner slots yet.</p>';
      return;
    }
    
    container.innerHTML = slots.map(s => `
      <div class="glass-card" style="padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between;">
        <div>
          <strong style="color: var(--accent)">${s.day}</strong> | ${s.time}
          <div style="margin-top: 5px">${s.subject}</div>
        </div>
        <button class="btn" style="background: var(--danger); padding: 5px 10px;" onclick="deleteSlot('${s.id}')">Delete</button>
      </div>
    `).join('');
  }

  window.deleteSlot = (id) => {
    slots = slots.filter(s => s.id !== id);
    ls.set('planner_slots', slots);
    render();
  };

  btnAdd.addEventListener('click', () => {
    const day = prompt('Day (e.g., Mon):');
    const time = prompt('Time (e.g., 10:00 - 11:00):');
    const subject = prompt('Subject:');
    
    if (day && time && subject) {
      slots.push({ id: Date.now().toString(), day, time, subject });
      ls.set('planner_slots', slots);
      render();
    }
  });

  render();
});