document.addEventListener('DOMContentLoaded', () => {
  const noteCanvas = document.getElementById('note-canvas');
  const noteText = document.getElementById('note-text');
  const saveBtn = document.getElementById('save-note-btn');
  const colorDots = document.querySelectorAll('.color-dot');

  let selectedColor = 'mint';

  // Color selection logic
  colorDots.forEach(dot => {
    dot.addEventListener('click', () => {
      // Remove active class from all dots
      colorDots.forEach(d => d.classList.remove('active'));

      // Add active class to clicked dot
      dot.classList.add('active');

      // Update selected color
      selectedColor = dot.dataset.color || 'custom';

      // Update note canvas background
      if (selectedColor === 'custom') {
        const customColor = document.getElementById('custom-color-input').value;
        noteCanvas.style.backgroundColor = customColor;
      } else {
        noteCanvas.style.backgroundColor = '';
        noteCanvas.className = `stick-note-editor note-${selectedColor}`;
      }
    });
  });

  // Custom color picker logic
  const customColorInput = document.getElementById('custom-color-input');
  if (customColorInput) {
    customColorInput.addEventListener('input', (e) => {
      selectedColor = e.target.value;
      noteCanvas.style.backgroundColor = selectedColor;

      // Set the swatch color
      const swatch = customColorInput.nextElementSibling;
      if (swatch) swatch.style.backgroundColor = selectedColor;
    });
  }

  // Save note logic
  saveBtn.addEventListener('click', () => {
    const text = noteText.value.trim();

    if (!text) {
      alert('Please write something in your note first!');
      return;
    }

    // Get existing notes or initialize
    const storedNotes = localStorage.getItem('makerpods_space_notes');
    const notes = storedNotes ? JSON.parse(storedNotes) : [];

    // Create new note object
    const currentBoardId = localStorage.getItem('currentBoardId');
    const newNote = {
      id: Date.now(), // Simple unique ID
      boardId: currentBoardId,
      text: text,
      color: selectedColor,
      date: new Date().toISOString().split('T')[0]
    };

    // Add to list and save
    notes.push(newNote);
    localStorage.setItem('makerpods_space_notes', JSON.stringify(notes));

    // Redirect back to the notes grid
    window.location.href = '../Stick Notes Menu/index.html';
  });
});
