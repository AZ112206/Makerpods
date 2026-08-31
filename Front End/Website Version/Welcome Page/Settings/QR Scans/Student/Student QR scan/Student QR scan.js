/* ==========================================
   Student QR scan — mirrors Sign Up Pt 5c
   (scan-camera + 6-char manual entry form)
   plus the Pt 5b QR-render shell for the
   "show my code" toggle.
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

  function getOrCreateStudentCode() {
    try {
      let code = localStorage.getItem("makerpodsStudentLinkCode");
      if (!code) {
        code = "S-" + randomBlock() + "-" + randomBlock();
        localStorage.setItem("makerpodsStudentLinkCode", code);
      }
      return code;
    } catch (e) {
      return "S-" + randomBlock() + "-" + randomBlock();
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

  function linkAsStudent() {
    try {
      localStorage.setItem("makerpodsStudentLinkedToParent", "true");
      localStorage.setItem(
        "makerpodsLinkedParent",
        JSON.stringify({ id: "demo-parent", linkedAt: Date.now() })
      );
    } catch (e) { /* ignore */ }

    // Instead of navigating away, we switch to the "Show my code" pane
    const scanPane = document.getElementById("scan-pane");
    const showPane = document.getElementById("show-pane");
    const toggleBtn = document.getElementById("toggle-show-btn");

    if (scanPane && showPane) {
      showPane.removeAttribute("hidden");
      scanPane.setAttribute("hidden", "");
      if (toggleBtn) toggleBtn.textContent = "Hide my code";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    const scanPane = qs("#scan-pane");
    const showPane = qs("#show-pane");
    const toggleBtn = qs("#toggle-show-btn");

    // Auto-show code if redirected from manual entry
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("action") === "show_code") {
      if (showPane) showPane.removeAttribute("hidden");
      if (scanPane) scanPane.setAttribute("hidden", "");
      if (toggleBtn) toggleBtn.textContent = "Hide my code";
    }

    const manualForm = qs("#manual-form");
    const codeInput = qs("#manual-code");
    const scanError = qs("#scan-error");
    const scanSuccess = qs("#scan-success");
    const continueBtn = qs("#continue-btn");

    const frame = qs("#self-qr-frame");
    const tokenEl = qs("#self-qr-token");

    const backBtn = qs("#back-btn");
    const finalContinueBtn = qs("#student-final-continue");

    // Pre-render the QR for the show-pane so the toggle reveals it instantly.
    const code = getOrCreateStudentCode();
    if (tokenEl) tokenEl.textContent = code;
    if (frame) renderQrIntoFrame(frame, "makerpods://student/" + code);

    if (toggleBtn && scanPane && showPane) {
      toggleBtn.addEventListener("click", () => {
        const showingQr = !showPane.hasAttribute("hidden");
        if (showingQr) {
          showPane.setAttribute("hidden", "");
          scanPane.removeAttribute("hidden");
          toggleBtn.textContent = "Show my code instead";
        } else {
          showPane.removeAttribute("hidden");
          scanPane.setAttribute("hidden", "");
          toggleBtn.textContent = "Hide my code";
        }
      });
    }

    if (manualForm) {
      manualForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const value = codeInput.value.trim().toUpperCase();
        if (value.length < 8) {
          if (scanError) {
            scanError.textContent = "Please enter a valid parent link code (e.g., P-XXXX-XXXX).";
            scanError.removeAttribute("hidden");
          }
          codeInput.focus();
          return;
        }
        if (scanError) scanError.setAttribute("hidden", "");
        if (manualForm) manualForm.setAttribute("hidden", "");
        if (scanSuccess) scanSuccess.removeAttribute("hidden");
      });
    }

    if (continueBtn) {
      continueBtn.addEventListener("click", () => {
        linkAsStudent();
      });
    }

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        navigateAway("../../Settings Menus/Student Settings Menu/Settings.html");
      });
    }

    if (finalContinueBtn) {
      finalContinueBtn.addEventListener("click", () => {
        navigateAway("../../../Dashboard/Student Dashboard/Student Dashboard.html");
      });
    }

    // Simulate a successful scan after the camera has had a moment — same
    // place where the real QR scan pipeline would post its success message.
    const scanWindow = qs("#scan-window");
    if (scanWindow) {
      setTimeout(() => {
        scanWindow.classList.add("no-camera");
      }, 1500);
    }
  });
})();
