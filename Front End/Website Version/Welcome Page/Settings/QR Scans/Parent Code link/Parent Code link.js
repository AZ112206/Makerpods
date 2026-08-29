/* ==========================================
   Parent Code link — manual-code form handler.
   Stores the link result in localStorage and
   routes to the Adult Dashboard on success, or
   back to the Parent Settings Menu on cancel.
   ========================================== */

(function () {
  "use strict";

  function navigateAway(href) {
    const card = document.querySelector(".scan-card");
    if (card) {
      card.classList.add("page-exit");
      setTimeout(() => { window.location.href = href; }, 240);
    } else {
      window.location.href = href;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("manual-form");
    const codeInput = document.getElementById("code-input");
    const nameInput = document.getElementById("student-name");
    const errorEl = document.getElementById("scan-error");
    const cancelBtn = document.getElementById("cancel-btn");

    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const code = codeInput.value.trim().toUpperCase();
        const name = nameInput.value.trim();
        if (!code || !name) {
          if (errorEl) {
            errorEl.textContent = !code
              ? "Please enter the link code from your son or daughter's device."
              : "Please enter your son or daughter's name.";
            errorEl.removeAttribute("hidden");
          }
          if (!code) codeInput.focus();
          else nameInput.focus();
          return;
        }
        try {
          localStorage.setItem("makerpodsParentModeLinked", "true");
          localStorage.setItem(
            "makerpodsLinkedStudent",
            JSON.stringify({ id: code, name: name, linkedAt: Date.now() })
          );
        } catch (e) { /* ignore */ }
        navigateAway("../../../Dashboard/Adult Dashboard/Adult Dashboard.html");
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        navigateAway("../Settings Menus/Parent Settings Menu/Settings.html");
      });
    }
  });
})();
