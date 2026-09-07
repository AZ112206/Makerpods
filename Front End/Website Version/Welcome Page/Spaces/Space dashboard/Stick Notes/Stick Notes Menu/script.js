document.addEventListener('DOMContentLoaded', () => {
  const notesGrid = document.getElementById('notes-grid');
  const searchInput = document.getElementById('board-search');
  const boardTitle = document.getElementById('board-title');

  // Load the board name for the board title
  const currentBoardId = localStorage.getItem('currentBoardId');
  const boards = JSON.parse(localStorage.getItem('makerpods_note_boards') || '[]');
  const currentBoard = boards.find(b => b.id == currentBoardId);

  if (currentBoard && boardTitle) {
    boardTitle.textContent = currentBoard.name;
  } else {
    window.location.href = '../Add Stick Note Board/Your Note Boards/index.html';
    return;
  }

  // Initial notes if none exist in localStorage
  const defaultNotes = [
    { id: 1, text: 'Welcome to your Space Notes! Click "New Note" to add your first thought.', color: 'mint', date: '2026-09-06' },
    { id: 2, text: 'Try using different colors for different categories of ideas.', color: 'sky', date: '2026-09-06' },
    { id: 3, text: 'Notes are saved locally to your browser.', color: 'rose', date: '2026-09-06' }
  ];

  function getNotes() {
    const stored = localStorage.getItem('makerpods_space_notes');
    return stored ? JSON.parse(stored) : defaultNotes;
  }

  function renderNotes(filter = '') {
    const notes = getNotes();
    const currentBoardId = localStorage.getItem('currentBoardId');
    notesGrid.innerHTML = '';

    const filteredNotes = notes.filter(note => {
      const matchesSearch = note.text.toLowerCase().includes(filter.toLowerCase());
      const matchesBoard = currentBoardId ? note.boardId == currentBoardId : true;
      return matchesSearch && matchesBoard;
    });

    if (filteredNotes.length === 0) {
      notesGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No notes found matching your search.</div>`;
      return;
    }

    filteredNotes.forEach((note, index) => {
      const card = document.createElement('div');
      if (note.color && note.color.startsWith('#')) {
        card.className = 'note-card';
        card.style.backgroundColor = note.color;
      } else {
        card.className = `note-card note-${note.color}`;
      }
      if (localStorage.getItem('lastSelectedNoteId') == note.id) {
        card.style.outline = '3px solid var(--primary-indigo)';
        card.style.outlineOffset = '2px';
      }
      card.innerHTML = `
        <div class="note-text">${note.text}</div>
        <div class="note-footer">
          <span>${note.date}</span>
          <span>#${index + 1}</span>
        </div>
      `;
      card.addEventListener('click', () => {
        localStorage.setItem('lastSelectedNoteId', note.id);
        renderNotes(searchInput.value); // Re-render to show selection

        // Store current note ID for the detail view
        localStorage.setItem('currentNoteId', note.id);
        window.location.href = '../Stick Note/index.html';
      });
      notesGrid.appendChild(card);
    });
  }

  searchInput.addEventListener('input', (e) => {
    renderNotes(e.target.value);
  });

  renderNotes();
});
