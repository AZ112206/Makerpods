document.addEventListener('DOMContentLoaded', () => {
  // Load the space name from localStorage
  const spaceName = localStorage.getItem('currentSpaceName');
  const panelTitle = document.getElementById('dashboard-panel-title');

  if (spaceName && panelTitle) {
    panelTitle.textContent = spaceName;
  }

  // Handle Navigation Tab Switching
  const navItems = document.querySelectorAll('.dashboard-nav-item');
  const panelContents = document.querySelectorAll('.dashboard-panel-content');
  const panelTitleEl = document.getElementById('dashboard-panel-title');
  const panelDescEl = document.getElementById('dashboard-panel-desc');

  const tabData = {
    'Home': {
      title: spaceName || 'Space Home',
      desc: 'Welcome to your space. Start collaborating!'
    },
    'Messages': {
      title: 'Messages',
      desc: 'Connect with your team and stay updated.'
    },
    'White board': {
      title: 'White board',
      desc: 'Visualize ideas and map out workflows.'
    },
    'Settings': {
      title: 'Space Settings',
      desc: 'Manage permissions and space configuration.'
    }
  };

  function switchTab(label) {
    // Update Active State
    navItems.forEach(nav => nav.classList.remove('active'));
    const activeItem = Array.from(navItems).find(item =>
      item.querySelector('.dashboard-nav-label')?.textContent === label
    );
    if (activeItem) activeItem.classList.add('active');

    // Update Content
    panelContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === `panel-${label.toLowerCase().replace(' ', '-')}`) {
        content.classList.add('active');
      }
    });

    // Update Header
    if (tabData[label]) {
      if (panelTitleEl) panelTitleEl.textContent = tabData[label].title;
      if (panelDescEl) panelDescEl.textContent = tabData[label].desc;
    }

    // Persist active tab
    localStorage.setItem('activeSpacePanel', label);
  }

  navItems.forEach(item => {
    if (item.tagName === 'BUTTON') {
      item.addEventListener('click', () => {
        const label = item.querySelector('.dashboard-nav-label').textContent;
        switchTab(label);
      });
    }
  });

  // Restore active tab on load
  const savedPanel = localStorage.getItem('activeSpacePanel');
  if (savedPanel && tabData[savedPanel]) {
    switchTab(savedPanel);
  }
});
