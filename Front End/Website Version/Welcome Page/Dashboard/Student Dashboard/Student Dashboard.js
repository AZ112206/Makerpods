document.addEventListener("DOMContentLoaded", () => {
  const htmlElement = document.documentElement;
  const navItems = document.querySelectorAll(".dashboard-nav-item[data-panel]");
  const panelContents = document.querySelectorAll(".dashboard-panel-content");
  const panelTitle = document.getElementById("dashboard-panel-title");
  const panelDesc = document.getElementById("dashboard-panel-desc");

  const PANEL_META = {
    home: {
      title: "Home",
      desc: "Welcome back to your workshop. Ready to build something today?"
    },
    overview: {
      title: "Overview",
      desc: "Here's how your projects and skills are growing."
    },
    projects: {
      title: "Projects",
      desc: "Open a new build or finish one in progress."
    },
    messages: {
      title: "Messages",
      desc: "Chat with friends and mentors."
    },
    community: {
      title: "Community",
      desc: "See what other kids are making and sharing."
    },
    analytics: {
      title: "Progress",
      desc: "Track your XP, streaks, and project wins."
    },
    resources: {
      title: "Resources",
      desc: "Tutorials, starter templates, and learning tracks."
    }
  };

  // Mirrors Settings.js: apply saved appearance modes (theme, surface, etc.)
  // so the dashboard reflects whatever the user picks in Settings.html.
  function applySavedTheme() {
    const savedTheme = localStorage.getItem("makerpodsTheme");
    const preferredTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    htmlElement.setAttribute("data-theme", preferredTheme);
  }

  function applySavedSurfaceMode() {
    const savedMode = localStorage.getItem("makerpodsSurfaceMode");
    const preferredMode = savedMode === "solid" || savedMode === "transparent" ? savedMode : "transparent";
    htmlElement.setAttribute("data-surface-mode", preferredMode);
  }

  applySavedTheme();
  applySavedSurfaceMode();

  // Re-apply modes whenever another tab/window updates them (e.g. user toggles
  // dark mode in Settings.html while the dashboard is open in another tab).
  window.addEventListener("storage", (event) => {
    if (event.key === "makerpodsTheme") applySavedTheme();
    if (event.key === "makerpodsSurfaceMode") applySavedSurfaceMode();
  });

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
