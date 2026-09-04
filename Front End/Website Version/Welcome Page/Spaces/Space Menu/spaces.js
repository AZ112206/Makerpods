document.addEventListener('DOMContentLoaded', () => {
  // --- New Space Button Logic ---
  const addSpaceBtn = document.querySelector('.add-space-circle');
  if (addSpaceBtn) {
    addSpaceBtn.addEventListener('click', () => {
      const spaceName = prompt('Enter the name of your new Space:');
      if (spaceName) {
        alert(`Space "${spaceName}" created successfully! (This is a mockup)`);
      }
    });
  }

  // --- Spaces Search Logic ---
  const searchInput = document.querySelector('.spaces-search-input');
  const bentoSquares = document.querySelectorAll('.bento-square');

  if (searchInput && bentoSquares.length > 0) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();

      bentoSquares.forEach(square => {
        const title = square.querySelector('h4').textContent.toLowerCase();
        const description = square.querySelector('p').textContent.toLowerCase();

        if (title.includes(searchTerm) || description.includes(searchTerm)) {
          square.style.display = 'flex';
        } else {
          square.style.display = 'none';
        }
      });
    });
  }

  // --- Universal Search Logic (Top Strip) ---
  const universalSearch = document.getElementById('universal-search');
  if (universalSearch) {
    universalSearch.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = universalSearch.value;
        alert(`Universal search for: ${query}\n(In a real app, this would search across Home, Spaces, Feeds, etc.)`);
      }
    });
  }

  // --- Bento Square Navigation ---
  bentoSquares.forEach(square => {
    square.addEventListener('click', () => {
      const spaceName = square.querySelector('h4').textContent;
      alert(`Navigating to Space: ${spaceName}\n(This would lead to the Space's dedicated page)`);
    });
  });
});
