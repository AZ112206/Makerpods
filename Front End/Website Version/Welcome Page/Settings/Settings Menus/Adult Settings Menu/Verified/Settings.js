document.addEventListener("DOMContentLoaded", () => {
  const htmlElement = document.documentElement;
  const navItems = document.querySelectorAll(".settings-nav-item");
  const panelContents = document.querySelectorAll(".settings-panel-content");
  const panelTitle = document.getElementById("settings-panel-title");
  const panelDesc = document.getElementById("settings-panel-desc");
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const transparencyToggle = document.getElementById("transparency-toggle");

    const PANEL_META = {
    appearance: {
      title: "Appearance",
      desc: "Customize how Makerpods looks."
    },
    account: {
      title: "Account",
      desc: "Manage your profile information."
    },
    notifications: {
      title: "Notifications",
      desc: "Control your notification preferences."
    },
        connections: {
      title: "Connections",
      desc: "Link your social media accounts."
    },
    privacy: {
      title: "Privacy & Security",
      desc: "Control your privacy and security settings."
    },
    help: {
      title: "Help & Support",
      desc: "Get help and learn more about Makerpods."
    },
    logout: {
      title: "Log Out",
      desc: "Sign out of your account."
    }
  };

  function applySavedTheme() {
    const savedTheme = localStorage.getItem("makerpodsTheme");
    const preferredTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    htmlElement.setAttribute("data-theme", preferredTheme);
    if (darkModeToggle) {
      darkModeToggle.checked = preferredTheme === "dark";
    }
  }

  function applySavedSurfaceMode() {
    const savedMode = localStorage.getItem("makerpodsSurfaceMode");
    const preferredMode = savedMode === "solid" || savedMode === "transparent" ? savedMode : "transparent";
    htmlElement.setAttribute("data-surface-mode", preferredMode);
    if (transparencyToggle) {
      transparencyToggle.checked = preferredMode === "transparent";
    }
  }

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

    function updateParentSetupLinks() {
    const parentModeItem = document.getElementById("parent-mode-item");
    const parentAddChildItem = document.getElementById("parent-add-child-item");

    if (!parentModeItem || !parentAddChildItem) return;

    const isParentLinked = localStorage.getItem("makerpodsParentModeLinked") === "true";
    const activeItem = isParentLinked ? parentAddChildItem : parentModeItem;
    const inactiveItem = isParentLinked ? parentModeItem : parentAddChildItem;

    if (inactiveItem) inactiveItem.style.display = "none";
    activeItem.style.display = "flex";
  }

  applySavedTheme();
  applySavedSurfaceMode();
  updateParentSetupLinks();

  

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      switchPanel(item.dataset.panel);
    });
  });

  if (darkModeToggle) {
    darkModeToggle.addEventListener("change", () => {
      const nextTheme = darkModeToggle.checked ? "dark" : "light";
      htmlElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("makerpodsTheme", nextTheme);
    });
  }

    if (transparencyToggle) {
      transparencyToggle.addEventListener("change", () => {
        const nextMode = transparencyToggle.checked ? "transparent" : "solid";
        htmlElement.setAttribute("data-surface-mode", nextMode);
        localStorage.setItem("makerpodsSurfaceMode", nextMode);
      });
    }

    // Notification toggles
    const notificationToggles = {
      push: document.getElementById("push-notifications-toggle"),
      email: document.getElementById("email-notifications-toggle"),
      message: document.getElementById("message-notifications-toggle"),
      follower: document.getElementById("follower-notifications-toggle")
    };

    function loadNotificationPrefs() {
      const saved = localStorage.getItem("makerpodsNotificationPrefs");
      if (!saved) return;
      try {
        const prefs = JSON.parse(saved);
        Object.keys(notificationToggles).forEach((key) => {
          if (notificationToggles[key] && typeof prefs[key] === "boolean") {
            notificationToggles[key].checked = prefs[key];
          }
        });
      } catch (e) {
        console.warn("Failed to parse saved notification prefs", e);
      }
    }

    function saveNotificationPrefs() {
      const prefs = {};
      Object.keys(notificationToggles).forEach((key) => {
        if (notificationToggles[key]) {
          prefs[key] = notificationToggles[key].checked;
        }
      });
      localStorage.setItem("makerpodsNotificationPrefs", JSON.stringify(prefs));
    }

    loadNotificationPrefs();

    Object.keys(notificationToggles).forEach((key) => {
      if (notificationToggles[key]) {
        notificationToggles[key].addEventListener("change", saveNotificationPrefs);
      }
    });

    // Privacy toggle
    const privateAccountToggle = document.getElementById("private-account-toggle");
    if (privateAccountToggle) {
      const savedPrivate = localStorage.getItem("makerpodsPrivateAccount");
      if (savedPrivate === "true") {
        privateAccountToggle.checked = true;
      }
      privateAccountToggle.addEventListener("change", () => {
        localStorage.setItem("makerpodsPrivateAccount", privateAccountToggle.checked ? "true" : "false");
      });
    }

  // Connections panel: social media URL inputs
  const connectionInputs = {
    facebook: document.getElementById("facebook-url"),
    twitter: document.getElementById("twitter-url"),
    instagram: document.getElementById("instagram-url"),
    snapchat: document.getElementById("snapchat-url"),
    tiktok: document.getElementById("tiktok-url"),
    linkedin: document.getElementById("linkedin-url")
  };

  const saveConnectionsBtn = document.getElementById("connections-save");
  const cancelConnectionsBtn = document.getElementById("connections-cancel");

  function loadSavedConnections() {
    const saved = localStorage.getItem("makerpodsConnections");
    if (!saved) return;
    try {
      const connections = JSON.parse(saved);
      Object.keys(connectionInputs).forEach((key) => {
        if (connectionInputs[key] && connections[key]) {
          connectionInputs[key].value = connections[key];
        }
      });
    } catch (e) {
      console.warn("Failed to parse saved connections", e);
    }
  }

  function saveConnections() {
    const connections = {};
    Object.keys(connectionInputs).forEach((key) => {
      if (connectionInputs[key]) {
        connections[key] = connectionInputs[key].value.trim();
      }
    });
    localStorage.setItem("makerpodsConnections", JSON.stringify(connections));
  }

  function cancelConnections() {
    loadSavedConnections();
  }

  loadSavedConnections();

  if (saveConnectionsBtn) {
    saveConnectionsBtn.addEventListener("click", saveConnections);
  }

  if (cancelConnectionsBtn) {
    cancelConnectionsBtn.addEventListener("click", cancelConnections);
  }
});