document.addEventListener("DOMContentLoaded", () => {
  const role = document.body.dataset.role || "student";
  const card = document.querySelector(".verify-card");
  const summaryList = document.getElementById("id-summary-list");
  const openVerifyBtn = document.getElementById("open-verify-btn");
  const skipBtn = document.getElementById("skip-btn");
  const backBtn = document.getElementById("back-btn");
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
      student: { name: "Son or daughter account", roleLabel: "Son or Daughter" },
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
        window.location.href = "../../../Sign Up Pt 6 (Welcome)/Sign Up Pt 6.html";
        return;
      }
      // Adults skip the QR family-link step (5b/5c) entirely.
      if (role === "adult") {
        window.location.href = "../../../Sign Up Pt 6 (Welcome)/Sign Up Pt 6.html";
        return;
      }
      // Otherwise (student), continue to 5b (QR generation).
      window.location.href = "../../Sign Up Student/Sign Up 5b/Sign Up Pt 5b.html";
    }, 280);
  }

  openVerifyBtn.addEventListener("click", async () => {
    try {
      // Call your Express backend to create the live Stripe Identity Session
      const response = await fetch('http://localhost:3000/api/stripe/create-verification-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        successUrl: 'http://localhost:3000/Front%20End/Website%20Version/Sign%20Up%20Page/Sign%20Up%20Pt%206%20(Welcome)/Sign%20Up%20Pt%206.html',
        cancelUrl: 'http://localhost:3000/Front%20End/Website%20Version/Sign%20Up%20Page/Sign%20Up%20Pt%205%20(ID%20Verification)/Sign%20Up%20Adult/Sign%20Up%205a/Sign%20Up%20Pt%205a.html'
      })
      });

      const data = await response.json();

      if (data.url) {
        sessionStorage.setItem("makerpodsIdVerificationChoice", "opened");
        if (card) card.classList.add("page-exit");
        setTimeout(() => {
          window.location.href = data.url;
        }, 280);
      } else {
        alert('Error: Could not create verification session.');
      }
    } catch (err) {
      console.error('Network or server error:', err);
      alert('Failed to connect to the backend server. Make sure your local Express server is running.');
    }
  });

  skipBtn.addEventListener("click", () => {
    openSkipModal();
  });

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (card) card.classList.add("page-exit");
      setTimeout(() => {
        window.location.href = "../../../Sign Up Pt 4a (Phone number optional)/Sign Up Pt 4a.html";
      }, 280);
    });
  }

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