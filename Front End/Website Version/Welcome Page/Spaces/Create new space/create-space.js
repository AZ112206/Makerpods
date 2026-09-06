document.addEventListener('DOMContentLoaded', () => {
  const addSpaceBtn = document.querySelector('.bento-add-space');
  const modal = document.getElementById('new-space-overlay');
  const closeBtn = document.getElementById('close-modal');

  // Modal basic functionality
  if (addSpaceBtn && modal && closeBtn) {
    addSpaceBtn.addEventListener('click', () => {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Form Logic
  const form = document.getElementById('create-space-form');
  if (form) {
    // Icon Selection
    const iconOptions = document.querySelectorAll('.icon-option:not(.more-icons)');
    iconOptions.forEach(option => {
      option.addEventListener('click', () => {
        iconOptions.forEach(opt => opt.classList.remove('active'));
        document.querySelectorAll('.extended-icon-option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
      });
    });




    // Color Selection
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
      option.addEventListener('click', () => {
        colorOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
      });
    });

    const customColorOption = document.querySelector('.custom-color-option');
    const customColorInput = customColorOption?.querySelector('input[type="color"]');
    const customColorSwatch = customColorOption?.querySelector('.color-picker-swatch');

    if (customColorOption && customColorInput && customColorSwatch) {
      customColorSwatch.style.backgroundColor = customColorInput.value;
      customColorInput.addEventListener('input', () => {
        customColorOption.dataset.color = customColorInput.value;
        customColorSwatch.style.backgroundColor = customColorInput.value;
        colorOptions.forEach(option => option.classList.remove('active'));
        customColorOption.classList.add('active');
      });
    }

    // Privacy Logic
    const privacyRadios = document.querySelectorAll('input[name="privacy"]');
    const privateOptions = document.getElementById('private-options');
    const askForCodeCheckbox = document.getElementById('ask-for-code');
    const codeInputGroup = document.getElementById('code-input-group');

    privacyRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.value === 'private') {
          privateOptions.classList.remove('hidden');
        } else {
          privateOptions.classList.add('hidden');
          // Reset conditional settings when going public
          if (askForCodeCheckbox) askForCodeCheckbox.checked = false;
          if (codeInputGroup) codeInputGroup.classList.add('hidden');
        }
      });
    });

    if (askForCodeCheckbox && codeInputGroup) {
      askForCodeCheckbox.addEventListener('change', () => {
        if (askForCodeCheckbox.checked) {
          codeInputGroup.classList.remove('hidden');
        } else {
          codeInputGroup.classList.add('hidden');
        }
      });
    }

    // Form Submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Space creation logic will be implemented here!');
      modal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
});