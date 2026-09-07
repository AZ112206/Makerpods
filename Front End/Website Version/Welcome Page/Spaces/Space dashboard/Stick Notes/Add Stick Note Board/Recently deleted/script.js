document.addEventListener('DOMContentLoaded', () => {
  const deletedBoardsList = document.getElementById('deleted-boards-list');
  const searchInput = document.getElementById('board-search');

  function getDeletedBoards() {
    const stored = localStorage.getItem('makerpods_deleted_boards');
    return stored ? JSON.parse(stored) : [];
  }

  function renderDeletedBoards(filter = '') {
    const boards = getDeletedBoards();
    deletedBoardsList.innerHTML = '';

    const filteredBoards = boards.filter(board =>
      board.name.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredBoards.length === 0) {
      deletedBoardsList.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No deleted boards found.</div>`;
      return;
    }

    filteredBoards.forEach(board => {
      const card = document.createElement('div');
      card.className = 'board-card';
      card.innerHTML = `
        <div class="board-card-icon" style="background-color: ${board.color}; color: white;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v4"/><path d="M9 3v4"/></svg>
        </div>
        <div class="board-card-info">
          <h4>${board.name}</h4>
          <p>Deleted on ${board.deleteDate || 'Unknown'}</p>
        </div>
        <div class="board-actions">
          <button class="action-btn restore-btn" data-id="${board.id}">Restore</button>
          <button class="action-btn purge-btn" data-id="${board.id}">Purge</button>
        </div>
      `;

      // Restore logic
      card.querySelector('.restore-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        restoreBoard(board.id);
      });

      // Purge logic
      card.querySelector('.purge-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        purgeBoard(board.id);
      });

      deletedBoardsList.appendChild(card);
    });
  }

  function restoreBoard(id) {
    const deleted = getDeletedBoards();
    const boardIndex = deleted.findIndex(b => b.id === id);
    if (boardIndex === -1) return;

    const board = deleted[boardIndex];

    // Add back to active boards
    const activeStored = localStorage.getItem('makerpods_note_boards');
    const active = activeStored ? JSON.parse(activeStored) : [];
    active.push(board);
    localStorage.setItem('makerpods_note_boards', JSON.stringify(active));

    // Remove from deleted
    deleted.splice(boardIndex, 1);
    localStorage.setItem('makerpods_deleted_boards', JSON.stringify(deleted));

    renderDeletedBoards();
  }

  function purgeBoard(id) {
    if (confirm('Permanently delete this board and all its notes? This cannot be undone.')) {
      const deleted = getDeletedBoards().filter(b => b.id !== id);
      localStorage.setItem('makerpods_deleted_boards', JSON.stringify(deleted));
      renderDeletedBoards();
    }
  }

  searchInput.addEventListener('input', (e) => {
    renderDeletedBoards(e.target.value);
  });

  renderDeletedBoards();
});
