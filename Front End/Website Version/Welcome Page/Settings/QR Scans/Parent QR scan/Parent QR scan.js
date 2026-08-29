/* ==========================================
   Parent QR scan — render a real, scannable QR
   into the Pt 5b-style frame, mirror the
   token line + waiting status + page-exit
   transition logic.
   ========================================== */

(function () {
  "use strict";

  const qs = (sel, root = document) => root.querySelector(sel);

  // Build a stable per-parent code (used for both the visible token line
  // and the QR payload). The QR encodes the code so it's recoverable from
  // any scan.
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

  function randomBlock() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < 4; i++) {
      out += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return out;
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
    const card = qs(".qr-card");
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
    navigateAway("../../../Dashboard/Parent Dashboard/Parent Dashboard.html");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const frame = qs("#qr-frame");
    const tokenEl = qs("#qr-token");
    const statusEl = qs("#qr-status");
    const backBtn = qs("#back-btn");
    const cameraBtn = qs("#open-camera-btn");
    const continueBtn = qs("#continue-btn");

    const code = getOrCreateParentCode();
    if (tokenEl) tokenEl.textContent = code;
    if (frame) renderQrIntoFrame(frame, "makerpods://parent/" + code);

    // Stub "scanned" simulation: shift to the green state when the user
    // taps Continue so the success visual mirrors Pt 5b's flow.
    if (continueBtn && statusEl) {
      continueBtn.addEventListener("click", () => {
        statusEl.classList.add("scanned");
        const text = qs(".qr-status-text", statusEl);
        if (text) text.textContent = "Link started — opening dashboard…";
        linkAsParent();
      });
    }

    if (cameraBtn) {
      cameraBtn.addEventListener("click", () => {
        navigateAway("../Parent Code link/Parent Code link.html");
      });
    }

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        navigateAway("../Settings Menus/Parent Settings Menu/Settings.html");
      });
    }
  });
})();
