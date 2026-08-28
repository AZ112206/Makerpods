document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("verify-form");
  const codeInputs = Array.from(form.querySelectorAll(".otp-input"));
  const submitBtn = document.getElementById("verify-submit-btn");
  const backBtn = document.getElementById("back-btn");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const themeIcon = document.getElementById("theme-icon");
  const transparencyToggleBtn = document.getElementById("transparency-toggle-btn");
  const transparencyIcon = document.getElementById("transparency-icon");
  const htmlElement = document.documentElement;

  const backRoutes = {
    student: "../Sign Up Pt 2b/Sign Up Pt 2b Student/Sign Up Pt 2b Student.html",
    adult: "../Sign Up Pt 2b/Sign Up Pt 2b Adult/Sign Up Pt 2b Adult.html"
  };

  function goTo(url) {
    const container = document.querySelector(".signup-container");
    if (!container) { window.location.href = url; return; }
    container.classList.add("page-exit");
    setTimeout(() => { window.location.href = url; }, 320);
  }

  const SUN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
  const MOON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  const CLEAR_SQ_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>`;
  const SOLID_SQ_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor"/></svg>`;

  function applyAppearance() {
    const theme = localStorage.getItem("makerpodsTheme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const mode = localStorage.getItem("makerpodsSurfaceMode") === "solid" ? "solid" : "transparent";
    htmlElement.setAttribute("data-theme", theme);
    htmlElement.setAttribute("data-surface-mode", mode);
    themeIcon.innerHTML = theme === "dark" ? SUN_SVG : MOON_SVG;
    transparencyIcon.innerHTML = mode === "transparent" ? CLEAR_SQ_SVG : SOLID_SQ_SVG;
  }
  themeToggleBtn.addEventListener("click", () => { const theme = htmlElement.getAttribute("data-theme") === "dark" ? "light" : "dark"; htmlElement.setAttribute("data-theme", theme); localStorage.setItem("makerpodsTheme", theme); themeIcon.innerHTML = theme === "dark" ? SUN_SVG : MOON_SVG; });
  transparencyToggleBtn.addEventListener("click", () => { const mode = htmlElement.getAttribute("data-surface-mode") === "transparent" ? "solid" : "transparent"; htmlElement.setAttribute("data-surface-mode", mode); localStorage.setItem("makerpodsSurfaceMode", mode); transparencyIcon.innerHTML = mode === "transparent" ? CLEAR_SQ_SVG : SOLID_SQ_SVG; });
  applyAppearance();

  function updateSubmitState() {
    const complete = codeInputs.every((input) => /^[A-Za-z0-9]$/.test(input.value));
    submitBtn.disabled = !complete;
    submitBtn.classList.toggle("is-ready", complete);
  }

  codeInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 1);
      if (input.value && codeInputs[index + 1]) {
        codeInputs[index + 1].focus();
      }
      updateSubmitState();
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Backspace" && !input.value && codeInputs[index - 1]) {
        codeInputs[index - 1].focus();
      }
    });

    input.addEventListener("paste", (event) => {
      event.preventDefault();
      const characters = (event.clipboardData.getData("text") || "").replace(/[^A-Za-z0-9]/g, "").split("");
      codeInputs.forEach((box, boxIndex) => { box.value = characters[boxIndex] || ""; });
      const nextEmpty = codeInputs.find((box) => !box.value) || codeInputs[codeInputs.length - 1];
      nextEmpty.focus();
      updateSubmitState();
    });
  });

  backBtn.addEventListener("click", () => {
    const role = sessionStorage.getItem("makerpodsUserRole");
    goTo(backRoutes[role] || "../Sign Up Pt 1 (Main Menu)/Sign Up Pt 1.html");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!submitBtn.disabled) {
      goTo("../Sign Up Pt 4a (Phone number optional)/Sign Up Pt 4a.html");
    }
  });
  updateSubmitState();
});
