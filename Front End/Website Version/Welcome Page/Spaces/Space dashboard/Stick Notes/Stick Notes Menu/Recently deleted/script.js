document.addEventListener('DOMContentLoaded', () => {
  const notesGrid = document.getElementById('deleted-notes-grid');
  const searchInput = document.getElementById('board-search');

  function getDeletedNotes() {
    const stored = localStorage.getItem('makerpods_deleted_space_notes');
    return stored ? JSON.parse(stored) : [];
  }

  function renderNotes(filter = '') {
    const notes = getDeletedNotes();
    notesGrid.innerHTML = '';

    const filteredNotes = notes.filter(note =>
      note.text.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredNotes.length === 0) {
      notesGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No deleted notes found.</div>`;
      return;
    }

    filteredNotes.forEach(note => {
      const card = document.createElement('div');
      if (note.color && note.color.startsWith('#')) {
        card.className = 'note-card';
        card.style.backgroundColor = note.color;
      } else {
        card.className = `note-card note-${note.color}`;
      }
      card.innerHTML = `
        <div class="note-text">${note.text}</div>
        <div class="note-footer">
          <span>${note.date}</span>
          <span style="cursor:pointer; color: var(--primary-indigo); font-weight: bold;" onclick="restoreNote(${note.id})">Restore</span>
        </div>
      `;
      notesGrid.appendChild(card);
    });
  }

  window.restoreNote = function(id) {
    const deletedNotes = getDeletedNotes();
    const noteIndex = deletedNotes.findIndex(n => n.id == id);
    if (noteIndex !== -1) {
      const note = deletedNotes[noteIndex];

      // Add back to main notes
      const mainNotes = JSON.parse(localStorage.getItem('makerpods_space_notes') || '[]');
      mainNotes.push(note);
      localStorage.setItem('makerpods_space_notes', JSON.stringify(mainNotes));

      // Remove from deleted
      deletedNotes.splice(noteIndex, 1);
      localStorage.setItem('makerpods_deleted_space_notes', JSON.stringify(deletedNotes));

      renderNotes();
    }
  };

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderNotes(e.target.value);
    });
  }

  renderNotes();
});
