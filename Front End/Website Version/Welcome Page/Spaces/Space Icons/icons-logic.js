document.addEventListener('DOMContentLoaded', () => {
  const iconsSlot = document.getElementById('space-icons-slot');

  if (!iconsSlot) return;

  fetch(new URL('../Space Icons/icons.html', document.baseURI))
    .then(response => {
      if (!response.ok) throw new Error(`Unable to load icons.html (${response.status})`);
      return response.text();
    })
    .then(markup => {
      iconsSlot.innerHTML = markup;
      initializeMoreIcons(document, iconsSlot);
    })
    .catch(error => console.error('More Icons component failed to load:', error));
});

function initializeMoreIcons(documentRoot, iconsSlot) {
  const moreIconsBtn = documentRoot.querySelector('.more-icons');
  const extendedIconsSection = iconsSlot.querySelector('.extended-icons-section');

  if (moreIconsBtn && extendedIconsSection && typeof SpaceIcons !== 'undefined') {
    // Populate icons dynamically from SpaceIcons
    const mainGrid = extendedIconsSection.querySelector('.extended-icons-grid');
    const lastRow = extendedIconsSection.querySelector('.extended-icons-last-row');

    if (mainGrid && lastRow) {
      mainGrid.innerHTML = '';
      lastRow.innerHTML = '';

      Object.entries(SpaceIcons).forEach(([key, svg], index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'extended-icon-option';
        btn.dataset.icon = key;
        btn.innerHTML = svg;

        if (index < 16) {
          mainGrid.appendChild(btn);
        } else {
          lastRow.appendChild(btn);
        }
      });
    }

    // Toggle extended section visibility
    moreIconsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      extendedIconsSection.classList.toggle('hidden');
      // Optional: scroll into view if it's long
      if (!extendedIconsSection.classList.contains('hidden')) {
        extendedIconsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    // Icon selection logic
    extendedIconsSection.addEventListener('click', (e) => {
      const option = e.target.closest('.extended-icon-option');
      if (option) {
        // Remove active from all options (default and extended)
        document.querySelectorAll('.icon-option, .extended-icon-option').forEach(opt => {
          opt.classList.remove('active');
        });
        option.classList.add('active');
      }
    });
  }
}
