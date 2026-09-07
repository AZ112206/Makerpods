document.addEventListener('DOMContentLoaded', () => {
  const notesGrid = document.getElementById('deleted-notes-grid');
  const searchInput = document.getElementById('board-search');
  const clearAllBtn = document.getElementById('clear-all-btn');

  function showModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmation-modal');
    const titleEl = document.getElementById('modal-title');
    const messageEl = document.getElementById('modal-message');
    const confirmBtn = document.getElementById('modal-confirm-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const closeBtn = document.getElementById('close-modal');

    titleEl.textContent = title;
    messageEl.textContent = message;

    modal.classList.add('active');

    const handleConfirm = () => {
      onConfirm();
      modal.classList.remove('active');
      confirmBtn.removeEventListener('click', handleConfirm);
    };

    confirmBtn.addEventListener('click', handleConfirm);

    const closeModal = () => {
      modal.classList.remove('active');
      confirmBtn.removeEventListener('click', handleConfirm);
    };

    cancelBtn.onclick = closeModal;
    closeBtn.onclick = closeModal;
  }

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
          <span>${note.date || ''}</span>
          <div class="note-actions">
            <button class="note-action-btn btn-restore" onclick="restoreNote(${note.id})">Restore</button>
            <button class="note-action-btn btn-purge" onclick="purgeNote(${note.id})">Purge</button>
          </div>
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

      const mainNotes = JSON.parse(localStorage.getItem('makerpods_space_notes') || '[]');
      mainNotes.push(note);
      localStorage.setItem('makerpods_space_notes', JSON.stringify(mainNotes));

      deletedNotes.splice(noteIndex, 1);
      localStorage.setItem('makerpods_deleted_space_notes', JSON.stringify(deletedNotes));

      renderNotes();
    }
  };

  window.purgeNote = function(id) {
    showModal('Permanently Delete', 'This action cannot be undone. Delete this note forever?', () => {
      const deletedNotes = getDeletedNotes();
      const filtered = deletedNotes.filter(n => n.id != id);
      localStorage.setItem('makerpods_deleted_space_notes', JSON.stringify(filtered));
      renderNotes();
    });
  }

  function purgeAllNotes() {
    showModal('Purge Everything', 'Are you sure you want to permanently delete all deleted notes? This action cannot be undone.', () => {
      localStorage.setItem('makerpods_deleted_space_notes', JSON.stringify([]));
      renderNotes();
    });
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', purgeAllNotes);
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderNotes(e.target.value);
    });
  }

  renderNotes();
});
