document.addEventListener('DOMContentLoaded', () => {
  const notesGrid = document.getElementById('deleted-notes-list');
  const searchInput = document.getElementById('board-search');
  const clearAllBtn = document.getElementById('clear-all-btn');
  let activeModalClose = null;

  if (!notesGrid) {
    console.error('Error: deleted-notes-list not found in DOM');
    return;
  }

  function showModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmation-modal');
    const titleEl = document.getElementById('modal-title');
    const messageEl = document.getElementById('modal-message');
    const confirmBtn = document.getElementById('modal-confirm-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const closeBtn = document.getElementById('close-modal');

    if (!modal || !confirmBtn) {
      console.error('Modal elements not found');
      return;
    }

    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;

    modal.hidden = false;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    const closeModal = () => {
      modal.classList.remove('active');
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      confirmBtn.onclick = null;
      if (cancelBtn) cancelBtn.onclick = null;
      if (closeBtn) closeBtn.onclick = null;
      modal.onclick = null;
      activeModalClose = null;
    };

    activeModalClose = closeModal;
    confirmBtn.onclick = () => {
      closeModal();
      onConfirm();
    };
    if (cancelBtn) cancelBtn.onclick = closeModal;
    if (closeBtn) closeBtn.onclick = closeModal;
    modal.onclick = (event) => {
      if (event.target === modal) closeModal();
    };
    confirmBtn.focus();
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activeModalClose) activeModalClose();
  });

  function getDeletedNotes() {
    const stored = localStorage.getItem('makerpods_deleted_space_notes');
    if (!stored) return [];
    try {
      const notes = JSON.parse(stored);
      return Array.isArray(notes) ? notes : [];
    } catch (error) {
      console.error('Unable to read deleted notes:', error);
      return [];
    }
  }

  function renderNotes(filter = '') {
    const notes = getDeletedNotes();
    notesGrid.innerHTML = '';

    const filteredNotes = notes.filter(note =>
      String(note.text || '').toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredNotes.length === 0) {
      notesGrid.innerHTML = `<div class="empty-state-box">No deleted notes found.</div>`;
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
            <button class="note-action-btn btn-restore">Restore</button>
            <button class="note-action-btn btn-purge">Purge</button>
          </div>
        </div>
      `;

      card.querySelector('.btn-restore').addEventListener('click', (e) => {
        e.stopPropagation();
        restoreNote(note.id);
      });

      card.querySelector('.btn-purge').addEventListener('click', (e) => {
        e.stopPropagation();
        purgeNote(note.id);
      });

      notesGrid.appendChild(card);
    });
  }

  function restoreNote(id) {
    const deletedNotes = getDeletedNotes();
    const noteIndex = deletedNotes.findIndex(n => n.id == id);
    if (noteIndex !== -1) {
      const note = deletedNotes[noteIndex];

      const mainNotes = JSON.parse(localStorage.getItem('makerpods_space_notes') || '[]');
      if (!mainNotes.some(existingNote => existingNote.id == note.id)) {
        mainNotes.push(note);
      }
      localStorage.setItem('makerpods_space_notes', JSON.stringify(mainNotes));

      deletedNotes.splice(noteIndex, 1);
      localStorage.setItem('makerpods_deleted_space_notes', JSON.stringify(deletedNotes));

      renderNotes(searchInput ? searchInput.value : '');
    }
  }

  function purgeNote(id) {
    showModal('Permanently Delete', 'This action cannot be undone. Delete this note forever?', () => {
      const deletedNotes = getDeletedNotes();
      const filtered = deletedNotes.filter(n => n.id != id);
      localStorage.setItem('makerpods_deleted_space_notes', JSON.stringify(filtered));
      renderNotes(searchInput ? searchInput.value : '');
    });
  }

  function purgeAllNotes() {
    showModal('Purge Everything', 'Are you sure you want to permanently delete all deleted notes? This action cannot be undone.', () => {
      localStorage.setItem('makerpods_deleted_space_notes', JSON.stringify([]));
      renderNotes(searchInput ? searchInput.value : '');
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
