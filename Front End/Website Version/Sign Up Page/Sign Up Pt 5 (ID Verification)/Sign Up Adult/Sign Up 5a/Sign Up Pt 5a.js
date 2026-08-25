document.addEventListener("DOMContentLoaded", () => {
  const role = document.body.dataset.role || "student";
  const card = document.querySelector(".verify-card");
  const summaryList = document.getElementById("id-summary-list");
  const openVerifyBtn = document.getElementById("open-verify-btn");
  const skipBtn = document.getElementById("skip-btn");
  const skipModal = document.getElementById("skip-modal");
  const skipModalBody = document.getElementById("skip-modal-body");
  const skipModalBack = document.getElementById("skip-modal-back");
  const skipModalProceed = document.getElementById("skip-modal-proceed");

  // Pull whatever data was saved earlier in the flow and surface it as
  // a read-only summary so the user can confirm what we have on file.
  function loadAccountSummary() {
    const keys = {
      student: "makerpodsStudentLegalData",
      parent: "makerpodsParentLegalData",
      adult: "makerpodsAdultLegalData"
    };
    const fallback = {
      student: { name: "Student account", roleLabel: "Student" },
      parent: { name: "Parent account", roleLabel: "Parent" },
      adult: { name: "Account", roleLabel: "Adult" }
    };

    const raw = sessionStorage.getItem(keys[role] || "");
    let data = null;
    if (raw) {
      try { data = JSON.parse(raw); } catch (e) { data = null; }
    }

    const rows = [];

    rows.push({
      label: "Account type",
      value: data && data.accountType
        ? data.accountType
        : fallback[role].roleLabel
    });

    rows.push({
      label: "Full name",
      value: pickName(data) || fallback[role].name
    });

    rows.push({
      label: "Date of birth",
      value: data && (data.dateOfBirth || data.dob) ? (data.dateOfBirth || data.dob) : "Not provided"
    });

    rows.push({
      label: "Email",
      value: getEmailFromSession() || "Not provided"
    });

    summaryList.innerHTML = rows.map((row) => `
      <div class="summary-row">
        <dt>${escapeHtml(row.label)}</dt>
        <dd class="${row.value === "Not provided" ? "muted" : ""}">${escapeHtml(row.value)}</dd>
      </div>
    `).join("");
  }

  function pickName(data) {
    if (!data) return null;
    if (data.fullName) return data.fullName;
    if (data.firstName || data.lastName) {
      return [data.firstName, data.lastName].filter(Boolean).join(" ");
    }
    return null;
  }

  function getEmailFromSession() {
    const candidates = [
      "makerpodsAccountData",
      "makerpodsEmailVerification",
      "makerpodsSignUpData"
    ];
    for (const key of candidates) {
      const raw = sessionStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.email) return parsed.email;
        if (parsed && parsed.emailAddress) return parsed.emailAddress;
      } catch (e) { /* ignore */ }
    }
    return null;
  }

  function escapeHtml(value) {
    if (value == null) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function goToNext(step) {
    // Remember the user's choice for the resume step.
    sessionStorage.setItem("makerpodsIdVerificationChoice", step);
    if (card) card.classList.add("page-exit");
    setTimeout(() => {
      // Skipping the modal jumps straight to Pt 6 for every role.
      if (step === "skipped") {
        window.location.href = "../../../../Sign Up Pt 6 (Welcome)/Sign Up Pt 6.html";
        return;
      }
      // Otherwise (Open verification), continue to 5b (QR generation).
      const folder = role === "parent" ? "Parent" : "Student";
      window.location.href = "../../Sign Up " + folder + "/Sign Up 5b/Sign Up Pt 5b.html";
    }, 280);
  }

  openVerifyBtn.addEventListener("click", () => {
    // Placeholder for an external identity-verification partner.
    // The verification page would be opened in a new tab; we mark the
    // session so 5b/5c can show a "verified" badge if the partner pings back.
    const partnerUrl = "https://verify.example.com/makerpods?role=" + encodeURIComponent(role);
    try {
      window.open(partnerUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      // Some sandboxed contexts block popups; fall back to in-page nav.
      window.location.href = partnerUrl;
      return;
    }
    sessionStorage.setItem("makerpodsIdVerificationChoice", "opened");
    if (card) card.classList.add("page-exit");
    setTimeout(() => {
      if (role === "adult") {
        window.location.href = "../../../../Sign Up Pt 6 (Welcome)/Sign Up Pt 6.html";
        return;
      }
      const folder = role === "parent" ? "Parent" : "Student";
      window.location.href = "../../Sign Up " + folder + "/Sign Up 5b/Sign Up Pt 5b.html";
    }, 280);
  });

  skipBtn.addEventListener("click", () => {
    openSkipModal();
  });

  // Skip-confirm modal: show role-specific warning, Proceed goes to Pt 6,
  // Go back dismisses the modal so the user can keep verifying.
  const SKIP_COPY = {
    student:
      "If you skip, Makerpods will need to verify that you and your parent are related before you can use the full app. " +
      "That check can take a few days, and some features will stay limited until it's done.",
    parent:
      "If you skip, Makerpods will need to verify that you and your child are related before you can approve their activity. " +
      "That check can take a few days, and some features will stay limited until it's done.",
    adult:
      "If you skip, you'll still be able to use Makerpods, but some features will stay limited until you complete ID verification later."
  };

  function openSkipModal() {
    if (!skipModal) { goToNext("skipped"); return; }
    if (skipModalBody) skipModalBody.textContent = SKIP_COPY[role] || SKIP_COPY.student;
    skipModal.hidden = false;
    // Move focus into the modal for keyboard / screen-reader users.
    if (skipModalBack) skipModalBack.focus();
  }

  function closeSkipModal() {
    if (skipModal) skipModal.hidden = true;
    if (skipBtn) skipBtn.focus();
  }

  if (skipModalBack) {
    skipModalBack.addEventListener("click", closeSkipModal);
  }
  if (skipModalProceed) {
    skipModalProceed.addEventListener("click", () => {
      closeSkipModal();
      goToNext("skipped");
    });
  }
  if (skipModal) {
    skipModal.addEventListener("click", (event) => {
      if (event.target === skipModal) closeSkipModal();
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && skipModal && !skipModal.hidden) closeSkipModal();
  });

  loadAccountSummary();
});
