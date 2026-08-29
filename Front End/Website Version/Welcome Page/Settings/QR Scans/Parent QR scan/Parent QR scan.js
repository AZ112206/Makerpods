document.addEventListener("DOMContentLoaded", () => {
  const openCameraBtn = document.getElementById("open-camera-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const selfQrContainer = document.getElementById("self-qr");

  // Build (and persist) a stable parent identifier so the QR encodes a
  // payload that another device can recognise. Falls back to an in-memory
  // id if localStorage is unavailable.
  function getOrCreateParentId() {
    try {
      let id = localStorage.getItem("makerpodsParentUserId");
      if (!id) {
        id = "P-" + Math.random().toString(36).slice(2, 8).toUpperCase() +
             "-" + Date.now().toString(36).toUpperCase();
        localStorage.setItem("makerpodsParentUserId", id);
      }
      return id;
    } catch (e) {
      return "P-TEMP-" + Date.now().toString(36).toUpperCase();
    }
  }

  // Render a real scannable QR into the hero card.
  if (selfQrContainer && typeof QRCode !== "undefined") {
    const payload = "makerpods://parent/" + getOrCreateParentId();
    selfQrContainer.innerHTML = "";
    new QRCode(selfQrContainer, {
      text: payload,
      width: 240,
      height: 240,
      colorDark: "#1E293B",
      colorLight: "#FFFFFF",
      correctLevel: QRCode.CorrectLevel.M,
    });
  }

  if (openCameraBtn) {
    openCameraBtn.addEventListener("click", () => {
      // Placeholder for the real camera/QR scan pipeline.
      // Once a code is detected, mark Parent Mode as set up so the
      // Settings page hides its Parent Mode row, then send the user to
      // the Parent Dashboard.
      openCameraBtn.textContent = "Linking…";
      openCameraBtn.disabled = true;
      openCameraBtn.style.opacity = "0.7";

      setTimeout(() => {
        try {
          localStorage.setItem("makerpodsParentModeLinked", "true");
          localStorage.setItem(
            "makerpodsLinkedStudent",
            JSON.stringify({ id: "demo-student", linkedAt: Date.now() })
          );
        } catch (e) {
          /* localStorage may be unavailable; continue to dashboard anyway */
        }
        window.location.href = "../../../Dashboard/Parent Dashboard/Parent Dashboard.html";
      }, 700);
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      window.location.href = "../Settings Menus/Parent Settings Menu/Settings.html";
    });
  }
});
