document.addEventListener("DOMContentLoaded", () => {
  const toggleShowBtn = document.getElementById("toggle-show-btn");
  const myQrSection = document.getElementById("my-qr-section");
  const openCameraBtn = document.getElementById("open-camera-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const selfQrContainer = document.getElementById("self-qr");

  // Build (and persist) a stable student identifier so the QR encodes a
  // payload that another device can recognise. Falls back to an in-memory
  // id if localStorage is unavailable.
  function getOrCreateStudentId() {
    try {
      let id = localStorage.getItem("makerpodsStudentUserId");
      if (!id) {
        id = "S-" + Math.random().toString(36).slice(2, 8).toUpperCase() +
             "-" + Date.now().toString(36).toUpperCase();
        localStorage.setItem("makerpodsStudentUserId", id);
      }
      return id;
    } catch (e) {
      return "S-TEMP-" + Date.now().toString(36).toUpperCase();
    }
  }

  // Render a real scannable QR into the self-QR panel whenever the user
  // reveals it. (qrcodejs is idempotent enough to redraw on toggle, but we
  // skip re-rendering if the panel is left hidden the first time.)
  function renderStudentQr() {
    if (!selfQrContainer || typeof QRCode === "undefined") return;
    if (selfQrContainer.dataset.rendered === "1") return;
    const payload = "makerpods://student/" + getOrCreateStudentId();
    selfQrContainer.innerHTML = "";
    new QRCode(selfQrContainer, {
      text: payload,
      width: 240,
      height: 240,
      colorDark: "#1E293B",
      colorLight: "#FFFFFF",
      correctLevel: QRCode.CorrectLevel.M,
    });
    selfQrContainer.dataset.rendered = "1";
  }

  if (toggleShowBtn && myQrSection) {
    toggleShowBtn.addEventListener("click", () => {
      const isHidden = myQrSection.hasAttribute("hidden");
      if (isHidden) {
        renderStudentQr();
        myQrSection.removeAttribute("hidden");
        toggleShowBtn.textContent = "Hide my QR";
      } else {
        myQrSection.setAttribute("hidden", "");
        toggleShowBtn.textContent = "Show my QR instead";
      }
    });
  }

  if (openCameraBtn) {
    openCameraBtn.addEventListener("click", () => {
      // Placeholder for the real camera/QR scan pipeline.
      // Once a parent's code is detected, mark the link as requested and
      // send the student back to their dashboard.
      openCameraBtn.textContent = "Linking…";
      openCameraBtn.disabled = true;
      openCameraBtn.style.opacity = "0.7";

      setTimeout(() => {
        try {
          localStorage.setItem("makerpodsStudentLinkedToParent", "true");
          localStorage.setItem(
            "makerpodsLinkedParent",
            JSON.stringify({ id: "demo-parent", linkedAt: Date.now() })
          );
        } catch (e) {
          /* localStorage may be unavailable; continue to dashboard anyway */
        }
        window.location.href = "../../../Dashboard/Student Dashboard/Student Dashboard.html";
      }, 700);
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      window.location.href = "../Settings Menus/Student Settings Menu/Settings.html";
    });
  }
});
