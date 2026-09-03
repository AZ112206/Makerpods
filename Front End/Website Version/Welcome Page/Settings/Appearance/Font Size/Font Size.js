document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('fontSizeToggle');
    const optionsContainer = document.getElementById('optionsContainer');
    const currentFontSizeDisplay = document.getElementById('currentFontSize');
    const options = document.querySelectorAll('.option');

    // Toggle dropdown
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('open');
    });

    // Handle option selection
    options.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            options.forEach(opt => opt.classList.remove('selected'));

            // Add selected class to clicked option
            option.classList.add('selected');

            // Update display label
            const label = option.getAttribute('data-label');
            const size = option.getAttribute('data-size');
            currentFontSizeDisplay.textContent = `${label} (${size})`;

            // Close dropdown
            toggle.classList.remove('open');

            // Apply font size to the body
            document.body.style.fontSize = size;

            console.log(`Font size changed to: ${size}`);
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!toggle.contains(event.target) && !optionsContainer.contains(event.target)) {
            toggle.classList.remove('open');
        }
    });
});
