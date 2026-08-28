document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".dashboard-nav-item[data-panel]");
  const panelContents = document.querySelectorAll(".dashboard-panel-content");
  const panelTitle = document.getElementById("dashboard-panel-title");
  const panelDesc = document.getElementById("dashboard-panel-desc");

  const PANEL_META = {
    overview: {
      title: "Overview",
      desc: "Welcome back. Here's your snapshot."
    },
    projects: {
      title: "Projects",
      desc: "Manage and continue your projects."
    },
    messages: {
      title: "Messages",
      desc: "Conversations and updates from your network."
    },
    community: {
      title: "Community",
      desc: "See what others are making and sharing."
    },
    analytics: {
      title: "Analytics",
      desc: "Track how your work is performing."
    },
    resources: {
      title: "Resources",
      desc: "Guides, templates, and learning material."
    }
  };

  function switchPanel(panelId) {
    navItems.forEach((item) => {
      item.classList.toggle("active", item.dataset.panel === panelId);
    });

    panelContents.forEach((content) => {
      content.classList.toggle("active", content.id === `panel-${panelId}`);
    });

    const meta = PANEL_META[panelId];
    if (meta && panelTitle && panelDesc) {
      panelTitle.textContent = meta.title;
      panelDesc.textContent = meta.desc;
    }
  }

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      switchPanel(item.dataset.panel);
    });
  });
});
