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

  async function updateParentSetupLinks(verified) {
      const parentModeItem = document.getElementById("parent-mode-item");
      const parentAddChildItem = document.getElementById("parent-add-child-item");
      const verifyItem = document.getElementById("verify-id-item");
      const linkedAccountsItem = document.getElementById("linked-accounts-item");

      if (!parentModeItem || !parentAddChildItem) return;

      if (!verified) {
        // Not verified: hide parent setup, show only Verify Your Identity
        parentModeItem.style.display = "none";
        parentAddChildItem.style.display = "none";
        if (verifyItem) verifyItem.style.display = "flex";
        return;
      }

      // Verified: hide Verify Your Identity, show the appropriate parent setup row
      if (verifyItem) verifyItem.style.display = "none";

      const isParentLinked = localStorage.getItem("makerpodsParentModeLinked") === "true";
      const activeItem = isParentLinked ? parentAddChildItem : parentModeItem;
      const inactiveItem = isParentLinked ? parentModeItem : parentAddChildItem;

      if (inactiveItem) inactiveItem.style.display = "none";
      activeItem.style.display = "flex";

      // Position after Linked Accounts
      if (linkedAccountsItem) {
        linkedAccountsItem.parentNode.insertBefore(activeItem, linkedAccountsItem.nextSibling);
      }
    }

  async function checkVerificationStatus() {
    try {
      const response = await fetch('http://localhost:3000/api/stripe/verification-status');
      const data = await response.json();
      const verifyItem = document.getElementById("verify-id-item");
      if (verifyItem) {
        verifyItem.style.display = data.verified ? "none" : "flex";
      }
      await updateParentSetupLinks(data.verified);
    } catch (err) {
      console.error('Failed to check verification status:', err);
      const verifyItem = document.getElementById("verify-id-item");
      if (verifyItem) verifyItem.style.display = "flex";
      await updateParentSetupLinks(false);
    }
  }

  applySavedTheme();
  applySavedSurfaceMode();
  checkVerificationStatus();

  // Update the profile role to "Parent" if the adult has linked a child.
  try {
    if (localStorage.getItem("makerpodsParentModeLinked") === "true") {
      const roleSpan = document.querySelector(".sidebar-profile-role");
      if (roleSpan) {
        roleSpan.textContent = "Parent";
      }
    }
  } catch (e) {
    /* localStorage unavailable */
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

  // ID Verification Redirect
  const verifyItem = document.getElementById("verify-id-item");
  if (verifyItem) {
    verifyItem.addEventListener("click", async () => {
      try {
                const successUrl = 'http://localhost:3000/Front%20End/Website%20Version/Welcome%20Page/Settings/Settings%20Menus/Adult%20Settings%20Menu/Settings.html';
        const cancelUrl = 'http://localhost:3000/Front%20End/Website%20Version/Welcome%20Page/Settings/Settings%20Menus/Adult%20Settings%20Menu/Settings.html';

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