document.addEventListener('DOMContentLoaded', () => {
  const noteCanvas = document.getElementById('note-canvas');
  const noteText = document.getElementById('note-text');
  const editBtn = document.getElementById('edit-btn');
  const deleteBtn = document.getElementById('delete-btn');
  const editBtnText = document.getElementById('edit-btn-text');

  const currentNoteId = localStorage.getItem('currentNoteId');
  let isEditing = false;
  let selectedColor = '';
  const colorOptions = document.querySelectorAll('.color-option');

  function getNotes() {
    const stored = localStorage.getItem('makerpods_space_notes');
    return stored ? JSON.parse(stored) : [];
  }

  function findNote() {
    const notes = getNotes();
    return notes.find(n => n.id == currentNoteId);
  }

  function applyNoteColor(color) {
    const normalizedColor = String(color || 'mint');
    noteCanvas.className = 'stick-note-detail';

    if (normalizedColor.startsWith('#')) {
      noteCanvas.style.backgroundColor = normalizedColor;
    } else {
      noteCanvas.style.backgroundColor = '';
      noteCanvas.classList.add(`note-${normalizedColor}`);
    }
  }

  function loadNote() {
    const note = findNote();
    if (!note) {
      alert('Note not found!');
      window.location.href = '../Stick Notes Menu/index.html';
      return;
    }

    // Set text
    noteText.value = note.text;

    // Set color
    selectedColor = String(note.color || 'mint');
    applyNoteColor(selectedColor);

    // Highlight active color option
    colorOptions.forEach(opt => {
      if (opt.dataset.color === selectedColor) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }

  function toggleEdit() {
    isEditing = !isEditing;

    if (isEditing) {
      noteText.readOnly = false;
      noteText.focus();
      editBtnText.textContent = 'Save Changes';
      editBtn.classList.add('save-active');
      document.getElementById('color-picker').style.display = 'flex';
    } else {
      noteText.readOnly = true;
      editBtnText.textContent = 'Edit Note';
      editBtn.classList.remove('save-active');
      document.getElementById('color-picker').style.display = 'none';
    }
  }

  function saveChanges() {
    const notes = getNotes();
    const noteIndex = notes.findIndex(n => n.id == currentNoteId);

    if (noteIndex !== -1) {
      notes[noteIndex].text = noteText.value;
      notes[noteIndex].color = selectedColor;
      localStorage.setItem('makerpods_space_notes', JSON.stringify(notes));
    }
  }

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

  function deleteNote() {
    showModal('Delete Note', 'Are you sure you want to delete this note?', () => {
      const notes = getNotes();
      const noteToDelete = notes.find(n => n.id == currentNoteId);

      if (noteToDelete) {
        const deletedNotes = JSON.parse(localStorage.getItem('makerpods_deleted_space_notes') || '[]');
        deletedNotes.push(noteToDelete);
        localStorage.setItem('makerpods_deleted_space_notes', JSON.stringify(deletedNotes));
      }

      const remainingNotes = notes.filter(n => n.id != currentNoteId);
      localStorage.setItem('makerpods_space_notes', JSON.stringify(remainingNotes));
      window.location.href = '../Stick Notes Menu/index.html';
    });
  }


  editBtn.addEventListener('click', () => {
    if (isEditing) {
      saveChanges();
    }
    toggleEdit();
  });

  deleteBtn.addEventListener('click', deleteNote);

  colorOptions.forEach(option => {
    option.addEventListener('click', () => {
      const color = option.dataset.color;
      if (color) {
        selectedColor = color;
        colorOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        applyNoteColor(selectedColor);
      }
    });
  });

  const customColorInput = document.getElementById('custom-color-input');
  if (customColorInput) {
    customColorInput.addEventListener('input', (e) => {
      selectedColor = e.target.value;
      applyNoteColor(selectedColor);
      const swatch = customColorInput.nextElementSibling;
      if (swatch) swatch.style.backgroundColor = selectedColor;
      colorOptions.forEach(opt => opt.classList.remove('active'));
      customColorInput.parentElement.classList.add('active');
    });
  }

  loadNote();
});
