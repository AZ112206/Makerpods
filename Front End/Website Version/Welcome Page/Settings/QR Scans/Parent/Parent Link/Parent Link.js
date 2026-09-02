/* ==========================================
   Parent Link — Unified linking flow.
   Reversed logic from Student:
   1. Show Parent QR code first.
   2. Switch to scanning Child's code to complete link.
   ========================================== */

(function () {
  "use strict";

  function applyTheme() {
    const savedTheme = localStorage.getItem("makerpodsTheme");
    const preferredTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", preferredTheme);
    const savedMode = localStorage.getItem("makerpodsSurfaceMode");
    const preferredMode = savedMode === "solid" || savedMode === "transparent" ? savedMode : "transparent";
    document.documentElement.setAttribute("data-surface-mode", preferredMode);
  }

  const qs = (sel, root = document) => root.querySelector(sel);

  function randomBlock() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < 4; i++) {
      out += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return out;
  }

  function getOrCreateParentCode() {
    try {
      let code = localStorage.getItem("makerpodsParentLinkCode");
      if (!code) {
        code = "P-" + randomBlock() + "-" + randomBlock();
        localStorage.setItem("makerpodsParentLinkCode", code);
      }
      return code;
    } catch (e) {
      return "P-" + randomBlock() + "-" + randomBlock();
    }
  }

  function renderQrIntoFrame(frame, payload) {
    frame.innerHTML = "";
    if (typeof QRCode === "undefined") return;
    new QRCode(frame, {
      text: payload,
      width: 240,
      height: 240,
      colorDark: "#0f172a",
      colorLight: "#FFFFFF",
      correctLevel: QRCode.CorrectLevel.M,
    });
  }

  function navigateAway(href) {
    const card = qs(".scan-card");
    if (card) {
      card.classList.add("page-exit");
      setTimeout(() => { window.location.href = href; }, 240);
    } else {
      window.location.href = href;
    }
  }

  function linkAsParent() {
    try {
      localStorage.setItem("makerpodsParentModeLinked", "true");
      localStorage.setItem(
        "makerpodsLinkedStudent",
        JSON.stringify({ id: "demo-student", linkedAt: Date.now() })
      );
    } catch (e) { /* ignore */ }
    navigateAway("../../Settings Menus/Parent Settings Menu/Settings.html");
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    const showPane = qs("#show-pane");
    const scanPane = qs("#scan-pane");
    const verifyChildBtn = qs("#verify-child-btn");
    const backToShowBtn = qs("#back-to-show-btn");
    const backBtn = qs("#back-btn");
    const finalContinueBtn = qs("#final-continue-btn");

    const frame = qs("#self-qr-frame");
    const tokenEl = qs("#self-qr-token");

    // Pre-render the QR for the show-pane
    const code = getOrCreateParentCode();
    if (tokenEl) tokenEl.textContent = code;
    if (frame) renderQrIntoFrame(frame, "makerpods://parent/" + code);

    // Switch from "Show QR" to "Scan Child"
    if (verifyChildBtn && showPane && scanPane) {
      verifyChildBtn.addEventListener("click", () => {
        showPane.setAttribute("hidden", "");
        scanPane.removeAttribute("hidden");
      });
    }

    // Switch back to "Show QR"
    if (backToShowBtn && showPane && scanPane) {
      backToShowBtn.addEventListener("click", () => {
        scanPane.setAttribute("hidden", "");
        showPane.removeAttribute("hidden");
      });
    }

    // Back to settings
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        navigateAway("../../../Settings Menus/Adult Settings Menu/Verified/Settings.html");
      });
    }

    // Complete link
    if (finalContinueBtn) {
      finalContinueBtn.addEventListener("click", () => {
        linkAsParent();
      });
    }

    // Simulate a successful scan after the camera has had a moment
    const scanWindow = qs("#scan-window");
    const scanSuccess = qs("#scan-success");
    if (scanWindow && scanSuccess) {
      // Only simulate success if we are actually in the scan pane
      if (!scanPane.hasAttribute("hidden")) {
        setTimeout(() => {
          scanWindow.classList.add("no-camera");
          scanSuccess.removeAttribute("hidden");
        }, 1500);
      }
    }
  });
})();
