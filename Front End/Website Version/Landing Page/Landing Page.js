document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const themeIcon = document.getElementById("theme-icon");
  const transparencyToggleBtn = document.getElementById("transparency-toggle-btn");
  const transparencyIcon = document.getElementById("transparency-icon");
  const htmlElement = document.documentElement;

  const SUN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  const MOON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  const CLEAR_SQ_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>`;
  const SOLID_SQ_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>`;

  function updateThemeIcon(theme) {
    if (!themeIcon) return;
    themeIcon.innerHTML = theme === "dark" ? SUN_SVG : MOON_SVG;
  }

  function applySavedTheme() {
    const savedTheme = localStorage.getItem("makerpodsTheme");
    const preferredTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    htmlElement.setAttribute("data-theme", preferredTheme);
    updateThemeIcon(preferredTheme);
  }

  function updateTransparencyIcon(mode) {
    if (!transparencyIcon) return;
    transparencyIcon.innerHTML = mode === "transparent" ? CLEAR_SQ_SVG : SOLID_SQ_SVG;
  }

  function applySavedSurfaceMode() {
    const savedMode = localStorage.getItem("makerpodsSurfaceMode");
    const preferredMode = savedMode === "solid" || savedMode === "transparent" ? savedMode : "transparent";
    htmlElement.setAttribute("data-surface-mode", preferredMode);
    updateTransparencyIcon(preferredMode);
  }

  if (themeToggleBtn && themeIcon) {
    applySavedTheme();
    applySavedSurfaceMode();

    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = htmlElement.getAttribute("data-theme") || "light";
      const nextTheme = currentTheme === "dark" ? "light" : "dark";

      htmlElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("makerpodsTheme", nextTheme);
      updateThemeIcon(nextTheme);
    });
  }

  if (transparencyToggleBtn && transparencyIcon) {
    transparencyToggleBtn.addEventListener("click", () => {
      const currentMode = htmlElement.getAttribute("data-surface-mode") || "transparent";
      const nextMode = currentMode === "transparent" ? "solid" : "transparent";

      htmlElement.setAttribute("data-surface-mode", nextMode);
      localStorage.setItem("makerpodsSurfaceMode", nextMode);
      updateTransparencyIcon(nextMode);
    });
  }
});
