document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('notes-container');
  const btnAdd = document.getElementById('btn-add-note');
  
  let notes = ls.get('notes', []);

  function render() {
    container.innerHTML = notes.map(n => `
      <div class="glass-card" style="padding: 20px; border-left: 4px solid var(--accent)">
        <h3 style="margin-top:0">${n.title}</h3>
        <p style="color: var(--text-secondary); white-space: pre-wrap;">${n.body || ''}</p>
        <button class="btn" style="padding: 5px 10px; font-size: 0.8rem; background: var(--danger)" onclick="deleteNote('${n.id}')">Delete</button>
      </div>
    `).join('') || '<p>No notes yet.</p>';
  }

  window.deleteNote = (id) => {
    notes = notes.filter(n => n.id !== id);
    ls.set('notes', notes);
    logActivity('Deleted note');
    render();
  };

  btnAdd.addEventListener('click', () => {
    const title = prompt('Note Title:');
    if (title) {
      const body = prompt('Note Body:');
      notes.push({
        id: Date.now().toString(),
        title,
        body,
        createdAt: new Date().toISOString()
      });
      ls.set('notes', notes);
      logActivity('Created note');
      render();
    }
  });

  render();
});