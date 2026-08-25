/* ==========================================
   Sign Up Pt 5c — scan QR or enter code
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
  const role = document.body.dataset.role || "student"; // role of THIS device
  const card = document.querySelector(".scan-card");
  const video = document.getElementById("scan-video");
  const scanWindow = document.getElementById("scan-window");
  const scanEmpty = document.getElementById("scan-empty");
  const manualForm = document.getElementById("manual-form");
  const manualInput = document.getElementById("manual-code");
  const errorEl = document.getElementById("scan-error");
  const successEl = document.getElementById("scan-success");
  const successMsg = document.getElementById("scan-success-msg");
  const continueBtn = document.getElementById("continue-btn");

  const COUNTERPARTY_ROLE = role === "parent" ? "student" : "parent";
  const COUNTERPARTY_LABEL = role === "parent" ? "child" : "parent";

  let detector = null;
  let stream = null;
  let rafId = null;
  let locked = false;

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function clearError() {
    errorEl.textContent = "";
    errorEl.hidden = true;
  }

  function normalizeCode(raw) {
    return (raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  }

  function handleToken(token) {
    if (locked) return;
    locked = true;

    // Look up the other party's expected token. In a real flow this would
    // round-trip through a backend. For this prototype we accept any
    // 6-character code (the family has to be at the same screen anyway),
    // and we notify the other tab via storage.
    if (!token || token.length < 4) {
      locked = false;
      showError("That code doesn't look right. Try again.");
      return;
    }

    const claim = { token: token, claimedBy: role, at: Date.now() };
    // localStorage so a sibling tab on the same origin picks it up via 'storage'
    try { localStorage.setItem("makerpodsLinkTokenClaimed", JSON.stringify(claim)); } catch (e) { /* ignore */ }
    // sessionStorage so the SAME tab can read the result on Pt 6 if it navigates directly
    sessionStorage.setItem("makerpodsLinkTokenClaimed", JSON.stringify(claim));
    sessionStorage.setItem("makerpodsFamilyLinked", "true");
    sessionStorage.setItem("makerpodsLinkRole", role);

    showSuccess();
  }

  function showSuccess() {
    successMsg.textContent = "Your " + COUNTERPARTY_LABEL + " and you are now connected on Makerpods.";
    successEl.hidden = false;
    if (manualForm) manualForm.hidden = true;
    if (scanWindow) scanWindow.hidden = true;
    if (errorEl) errorEl.hidden = true;

    // Stop camera if running
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    if (video) video.srcObject = null;
  }

  async function startCamera() {
    if (!("BarcodeDetector" in window)) {
      scanWindow.classList.add("no-camera");
      scanEmpty.querySelector("p").textContent = "Camera scanning isn't supported in this browser — use the code field below.";
      return;
    }
    try {
      detector = new window.BarcodeDetector({ formats: ["qr_code"] });
    } catch (e) {
      detector = null;
    }
    if (!detector) {
      scanWindow.classList.add("no-camera");
      scanEmpty.querySelector("p").textContent = "Camera scanning isn't supported in this browser — use the code field below.";
      return;
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      video.srcObject = stream;
      await video.play();
      scanEmpty.style.display = "none";
      tick();
    } catch (e) {
      scanWindow.classList.add("no-camera");
      scanEmpty.querySelector("p").textContent = "We couldn't access the camera — use the code field below.";
    }
  }

  async function tick() {
    if (!detector || !video || video.readyState < 2) {
      rafId = requestAnimationFrame(tick);
      return;
    }
    try {
      const codes = await detector.detect(video);
      if (codes && codes.length) {
        const raw = codes[0].rawValue || "";
        // Try to extract the token from the payload
        const match = raw.match(/MAKERPODS-LINK\|[A-Z]+\|([A-Z0-9]+)/i);
        const token = match ? match[1] : normalizeCode(raw);
        if (token) {
          handleToken(token);
          return;
        }
      }
    } catch (e) { /* swallow per-frame errors */ }
    rafId = requestAnimationFrame(tick);
  }

  manualForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearError();
    const token = normalizeCode(manualInput.value);
    if (token.length !== 6) {
      showError("Codes are 6 characters — letters and numbers only.");
      return;
    }
    handleToken(token);
  });

  manualInput.addEventListener("input", () => {
    manualInput.value = normalizeCode(manualInput.value);
    clearError();
  });

  continueBtn.addEventListener("click", () => {
    if (card) card.classList.add("page-exit");
    setTimeout(() => {
      // The link role is what gets persisted; the actual destination is Pt 6.
      window.location.href = "../../../../Sign Up Pt 6 (Welcome)/Sign Up Pt 6.html";
    }, 280);
  });

  startCamera();
});
