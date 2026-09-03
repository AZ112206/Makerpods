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

  async function checkVerificationStatus() {
    try {
      const response = await fetch('http://localhost:3000/api/stripe/verification-status');
      const data = await response.json();
      const verifyItem = document.getElementById("verify-id-item");
      if (verifyItem) {
        // Only show the verification item if the user is NOT verified
        verifyItem.style.display = data.verified ? "none" : "flex";
      }
    } catch (err) {
      console.error('Failed to check verification status:', err);
      // Fallback: show the button if we can't verify status, so they can try to verify
      const verifyItem = document.getElementById("verify-id-item");
      if (verifyItem) verifyItem.style.display = "flex";
    }
  }

  applySavedTheme();
  applySavedSurfaceMode();
  checkVerificationStatus();

  // Hide the Parent Mode row once the adult has linked at least one son or daughter.
  const parentModeItem = document.getElementById("parent-mode-item");
  if (parentModeItem) {
    try {
      if (localStorage.getItem("makerpodsParentModeLinked") === "true") {
        parentModeItem.style.display = "none";
      }
    } catch (e) {
      /* localStorage unavailable */
    }
  }

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

    // --- Layout Density Logic ---
    const layoutDensityContainer = document.getElementById("layout-density-container");
    const layoutDensityTrigger = document.getElementById("layout-density-trigger");
    const currentLayoutDensityDisplay = document.getElementById("current-layout-density");
    const layoutDensityOptions = document.querySelectorAll("#layout-density-dropdown .dropdown-option");

    function applyLayoutDensity(density, label) {
        document.body.classList.toggle("density-compact", density === "compact");
        document.body.classList.toggle("density-comfortable", density === "comfortable");
        if (currentLayoutDensityDisplay) {
            currentLayoutDensityDisplay.textContent = label;
        }
        localStorage.setItem("makerpodsLayoutDensity", density);
        localStorage.setItem("makerpodsLayoutDensityLabel", label);
    }

    function loadSavedLayoutDensity() {
        const savedDensity = localStorage.getItem("makerpodsLayoutDensity");
        const savedLabel = localStorage.getItem("makerpodsLayoutDensityLabel");
        if (savedDensity && savedLabel) {
            applyLayoutDensity(savedDensity, savedLabel);
        } else {
            applyLayoutDensity("comfortable", "Comfortable");
        }
    }

    if (layoutDensityTrigger) {
        layoutDensityTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            if (layoutDensityContainer) {
                layoutDensityContainer.classList.toggle("expanded");
            }
        });
    }

    layoutDensityOptions.forEach(option => {
        option.addEventListener("click", (e) => {
            e.stopPropagation();
            const density = option.dataset.density;
            const label = option.dataset.label;
            applyLayoutDensity(density, label);
            if (layoutDensityContainer) {
                layoutDensityContainer.classList.remove("expanded");
            }
        });
    });

    // --- Font Size Logic ---
    const fontSizeContainer = document.getElementById("font-size-container");
    const fontSizeTrigger = document.getElementById("font-size-trigger");
    const currentFontSizeDisplay = document.getElementById("current-font-size");
    const fontSizeOptions = document.querySelectorAll("#font-size-dropdown .dropdown-option");

    function applyFontSize(size, label) {
        htmlElement.style.setProperty('--global-font-size', size);
        if (currentFontSizeDisplay) {
            currentFontSizeDisplay.textContent = label;
        }
        localStorage.setItem("makerpodsFontSize", size);
        localStorage.setItem("makerpodsFontSizeLabel", label);
    }

    function loadSavedFontSize() {
        const savedSize = localStorage.getItem("makerpodsFontSize");
        const savedLabel = localStorage.getItem("makerpodsFontSizeLabel");
        if (savedSize && savedLabel) {
            applyFontSize(savedSize, savedLabel);
        } else {
            applyFontSize("100%", "Medium (100%)");
        }
    }

    if (fontSizeTrigger) {
        fontSizeTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            if (fontSizeContainer) {
                fontSizeContainer.classList.toggle("expanded");
            }
        });
    }

    fontSizeOptions.forEach(option => {
        option.addEventListener("click", (e) => {
            e.stopPropagation();
            const size = option.dataset.size;
            const label = option.dataset.label;
            applyFontSize(size, label);
            if (fontSizeContainer) {
                fontSizeContainer.classList.remove("expanded");
            }
        });
    });

    document.addEventListener("click", () => {
        if (layoutDensityContainer) layoutDensityContainer.classList.remove("expanded");
        if (fontSizeContainer) fontSizeContainer.classList.remove("expanded");
    });

    loadSavedLayoutDensity();
    loadSavedFontSize();

  const verifyItem = document.getElementById("verify-id-item");
  if (verifyItem) {
    verifyItem.addEventListener("click", async () => {
      try {
                const successUrl = 'http://localhost:3000/Front%20End/Website%20Version/Welcome%20Page/Settings/Settings%20Menus/Parent%20Settings%20Menu/Settings.html';
                const cancelUrl = 'http://localhost:3000/Front%20End/Website%20Version/Welcome%20Page/Settings/Settings%20Menus/Parent%20Settings%20Menu/Settings.html';

                const response = await fetch('http://localhost:3000/api/stripe/create-verification-session', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    successUrl: successUrl,
                    cancelUrl: cancelUrl
                  })
                });
                const data = await response.json();
                if (data.url) {
                  window.location.href = data.url;
                } else {
                  alert('Error: Could not create verification session.');
                }
      } catch (err) {
        console.error('Verification error:', err);
        alert('Failed to connect to the backend server.');
      }
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