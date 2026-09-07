document.addEventListener('DOMContentLoaded', () => {
  const openModalBtn = document.getElementById('open-create-board');
  const modal = document.getElementById('create-board-modal');
  const closeBtn = document.getElementById('close-modal');
  const form = document.getElementById('create-board-form');
  const boardsList = document.getElementById('boards-list');
  const searchInput = document.getElementById('board-search');

  // Modal Logic
  if (openModalBtn && modal && closeBtn) {
    openModalBtn.addEventListener('click', () => {
      modal.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }

  function renderBoards(filter = '') {
    const boards = JSON.parse(localStorage.getItem('makerpods_note_boards') || '[]');

    const existingBoards = boardsList.querySelectorAll('.board-card, .joined-empty-state');
    existingBoards.forEach(board => board.remove());

    const filteredBoards = boards.filter(b =>
      b.name.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredBoards.length === 0 && filter !== '') {
      const emptyState = document.createElement('div');
      emptyState.className = 'joined-empty-state';
      emptyState.innerHTML = `<p>No boards found matching your search.</p>`;
      boardsList.appendChild(emptyState);
      return;
    }

    filteredBoards.forEach(board => {
      const card = document.createElement('div');
      card.className = 'board-card';
      card.innerHTML = `
        <div class="board-card-icon" style="background: ${board.color}22; color: ${board.color};">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v4"/><path d="M9 3v4"/></svg>
        </div>
        <div class="board-card-info">
          <h4>${board.name}</h4>
          <p>Created on ${board.date}</p>
        </div>
      `;
      card.addEventListener('click', () => {
        localStorage.setItem('currentBoardId', board.id);
        window.location.href = '../../Stick Notes Menu/index.html';
      });
      boardsList.appendChild(card);
    });
  }

  // Color Selection in Modal
  const colorOptions = document.querySelectorAll('.color-option');
  let selectedColor = '#6366f1';

  colorOptions.forEach(option => {
    option.addEventListener('click', () => {
      colorOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      selectedColor = option.dataset.color;
    });

    const colorInput = option.querySelector('input[type="color"]');
    if (colorInput) {
      colorInput.addEventListener('input', (e) => {
        const color = e.target.value;
        option.dataset.color = color;
        selectedColor = color;
        const swatch = option.querySelector('.color-picker-swatch');
        if (swatch) {
          swatch.style.backgroundColor = color;
        }
      });
    }
  });

  // Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('board-name');
      const boardName = nameInput.value;

      let finalColor = selectedColor;
      if (selectedColor === 'any') {
        const palette = ['#6366f1', '#10b981', '#0ea5e9', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];
        finalColor = palette[Math.floor(Math.random() * palette.length)];
      }

      const newBoard = {
        id: Date.now(),
        name: boardName,
        color: finalColor,
        date: new Date().toISOString().split('T')[0]
      };

      const boards = JSON.parse(localStorage.getItem('makerpods_note_boards') || '[]');
      boards.push(newBoard);
      localStorage.setItem('makerpods_note_boards', JSON.stringify(boards));

      modal.classList.remove('active');
      nameInput.value = '';
      renderBoards();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderBoards(e.target.value);
    });
  }

  renderBoards();
});
