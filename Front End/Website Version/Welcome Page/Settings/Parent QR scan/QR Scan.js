document.addEventListener("DOMContentLoaded", () => {
  const htmlElement = document.documentElement;
  const openCameraBtn = document.getElementById("open-camera-btn");

  // Mirror Settings.js: read saved theme + surface mode from localStorage
  // so the QR scan page matches the user's preferences.
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

  window.addEventListener("storage", (event) => {
    if (event.key === "makerpodsTheme") applySavedTheme();
    if (event.key === "makerpodsSurfaceMode") applySavedSurfaceMode();
  });

  if (openCameraBtn) {
    openCameraBtn.addEventListener("click", () => {
      // Placeholder for the real camera/QR scan pipeline.
      // Once a code is detected, mark Parent Mode as set up so the Adult
      // Settings page hides its Parent Mode row, then send the user to the
      // Parent Dashboard where they can see their linked students.
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
        window.location.href = "../../Dashboard/Parent Dashboard/Parent Dashboard.html";
      }, 700);
    });
  }
});
