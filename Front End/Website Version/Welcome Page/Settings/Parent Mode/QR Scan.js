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
      // Placeholder: real camera/QR scanning is not yet wired.
      openCameraBtn.textContent = "Camera unavailable in preview";
      openCameraBtn.disabled = true;
      openCameraBtn.style.opacity = "0.7";
    });
  }
});
