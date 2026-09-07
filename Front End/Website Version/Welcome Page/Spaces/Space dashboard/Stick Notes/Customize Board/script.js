document.addEventListener('DOMContentLoaded', () => {
  const bgColorPicker = document.getElementById('bg-color-picker');
  const accentColorPicker = document.getElementById('accent-color-picker');
  const saveBtn = document.getElementById('save-settings');

  // Load saved settings
  const settings = JSON.parse(localStorage.getItem('makerpods_board_settings') || '{}');
  if (settings.bgColor) bgColorPicker.value = settings.bgColor;
  if (settings.accentColor) accentColorPicker.value = settings.accentColor;

  saveBtn.addEventListener('click', () => {
    const newSettings = {
      bgColor: bgColorPicker.value,
      accentColor: accentColorPicker.value
    };
    localStorage.setItem('makerpods_board_settings', JSON.stringify(newSettings));
    alert('Settings saved successfully!');
  });
});
