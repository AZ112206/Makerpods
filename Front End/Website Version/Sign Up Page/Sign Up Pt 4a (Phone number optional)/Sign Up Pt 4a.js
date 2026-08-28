document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("phone-form");
  const countryCodeInput = document.getElementById("country-code");
  const countryIsoInput = document.getElementById("country-iso");
  const phoneAreaCode = document.getElementById("phone-area-code");
  const phonePrefix = document.getElementById("phone-prefix");
  const phoneLine = document.getElementById("phone-line");
  const submitBtn = document.getElementById("phone-submit-btn");
  const skipBtn = document.getElementById("skip-btn");
  const backBtn = document.getElementById("back-btn");

  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const themeIcon = document.getElementById("theme-icon");
  const transparencyToggleBtn = document.getElementById("transparency-toggle-btn");
  const transparencyIcon = document.getElementById("transparency-icon");
  const htmlElement = document.documentElement;

  const phoneInputs = [phoneAreaCode, phonePrefix, phoneLine];

  const allCountryCodes = [
    "AD","AE","AF","AG","AI","AL","AM","AO","AQ","AR","AS","AT","AU","AW","AX","AZ",
    "BA","BB","BD","BE","BF","BG","BH","BI","BJ","BL","BM","BN","BO","BQ","BR","BS",
    "BT","BV","BW","BY","BZ","CA","CC","CD","CF","CG","CH","CI","CK","CL","CM","CN",
    "CO","CR","CU","CV","CW","CX","CY","CZ","DE","DJ","DK","DM","DO","DZ","EC","EE",
    "EG","EH","ER","ES","ET","FI","FJ","FK","FM","FO","FR","GA","GB","GD","GE","GF",
    "GG","GH","GI","GL","GM","GN","GP","GQ","GR","GS","GT","GU","GW","GY","HK","HM",
    "HN","HR","HT","HU","ID","IE","IL","IM","IN","IO","IQ","IR","IS","IT","JE","JM",
    "JO","JP","KE","KG","KH","KI","KM","KN","KP","KR","KW","KY","KZ","LA","LB","LC",
    "LI","LK","LR","LS","LT","LU","LV","LY","MA","MC","MD","ME","MF","MG","MH","MK",
    "ML","MM","MN","MO","MP","MQ","MR","MS","MT","MU","MV","MW","MX","MY","MZ","NA",
    "NC","NE","NF","NG","NI","NL","NO","NP","NR","NU","NZ","OM","PA","PE","PF","PG",
    "PH","PK","PL","PM","PN","PR","PS","PT","PW","PY","QA","RE","RO","RS","RU","RW",
    "SA","SB","SC","SD","SE","SG","SH","SI","SJ","SK","SL","SM","SN","SO","SR","SS",
    "ST","SV","SX","SY","SZ","TC","TD","TF","TG","TH","TJ","TK","TL","TM","TN","TO",
    "TR","TT","TV","TW","TZ","UA","UG","UM","US","UY","UZ","VA","VC","VE","VG","VI",
    "VN","VU","WF","WS","YE","YT","ZA","ZM","ZW"
  ];

  const countryDialCodes = {
    US: "+1", CA: "+1", GB: "+44", AU: "+61", DE: "+49", FR: "+33", IN: "+91", JP: "+81",
    BR: "+55", MX: "+52", ES: "+34", IT: "+39", CN: "+86", RU: "+7", KR: "+82", ZA: "+27",
    NL: "+31", SE: "+46", NO: "+47", FI: "+358", DK: "+45", CH: "+41", AT: "+43", NZ: "+64",
    SG: "+65", HK: "+852", IE: "+353", PH: "+63", PL: "+48", PT: "+351", AR: "+54", CL: "+56",
    CO: "+57", PE: "+51", IL: "+972", AE: "+971", SA: "+966", EG: "+20", NG: "+234", KE: "+254",
    PK: "+92", BD: "+880", TH: "+66", VN: "+84", ID: "+62", MY: "+60", GR: "+30", CZ: "+420",
    HU: "+36", RO: "+40", UA: "+380", TR: "+90"
  };

  function getDialCode(countryCode) {
    return countryDialCodes[countryCode] || "+1";
  }

  function goTo(url) {
    const container = document.querySelector(".signup-container");
    if (!container) { window.location.href = url; return; }
    container.classList.add("page-exit");
    setTimeout(() => { window.location.href = url; }, 320);
  }

  // Route to the correct Pt 5a subfolder based on the user's role
  // (parent / student / adult). Adults skip the family-link step and
  // jump straight to Pt 6.
  function goToIdVerification() {
    const role = sessionStorage.getItem("makerpodsUserRole");
    if (role === "student") {
      goTo("../Sign Up Pt 5 (ID Verification)/Sign Up Student/Sign Up 5a/Sign Up Pt 5a.html");
    } else {
      // Adult flow: still needs ID verification, but skips the QR/scan step
      // (5b/5c). 5a Adult routes directly to Pt 6 once Continue is tapped.
      goTo("../Sign Up Pt 5 (ID Verification)/Sign Up Adult/Sign Up 5a/Sign Up Pt 5a.html");
    }
  }

  /* Theme & Surface Mode Engine */
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
  themeToggleBtn.addEventListener("click", () => {
    const theme = htmlElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    htmlElement.setAttribute("data-theme", theme);
    localStorage.setItem("makerpodsTheme", theme);
    themeIcon.innerHTML = theme === "dark" ? SUN_SVG : MOON_SVG;
  });
  transparencyToggleBtn.addEventListener("click", () => {
    const mode = htmlElement.getAttribute("data-surface-mode") === "transparent" ? "solid" : "transparent";
    htmlElement.setAttribute("data-surface-mode", mode);
    localStorage.setItem("makerpodsSurfaceMode", mode);
    transparencyIcon.innerHTML = mode === "transparent" ? CLEAR_SQ_SVG : SOLID_SQ_SVG;
  });
  applyAppearance();

  /* Custom Select Implementation */
  let visibleCustomSelect = null;

  function closeCustomSelect(selectRoot) {
    selectRoot.classList.remove("open");
    const trigger = selectRoot.querySelector(".custom-select-trigger");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
    if (visibleCustomSelect === selectRoot) visibleCustomSelect = null;
  }

  function closeAllCustomSelects() {
    document.querySelectorAll(".custom-select.open").forEach((selectRoot) => closeCustomSelect(selectRoot));
  }

  function toFlagHtml(countryCode) {
    if (!/^[A-Z]{2}$/.test(countryCode)) return "";
    return `<span class="fi fi-${countryCode.toLowerCase()}"></span>`;
  }

  function getCountryOptions() {
    const displayNames = typeof Intl !== "undefined" && Intl.DisplayNames ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
    return allCountryCodes
      .map((code) => {
        const countryName = displayNames ? displayNames.of(code) : code;
        const dialCode = getDialCode(code);
        return {
          code,
          name: countryName || code,
          dialCode,
          flagHtml: toFlagHtml(code)
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => ({
        value: item.dialCode,
        countryIso: item.code,
        triggerLabel: `${item.flagHtml} ${item.dialCode}`,
        optionLabel: `${item.flagHtml} ${item.name} (${item.dialCode})`
      }));
  }

  function initCustomSelect(selectRoot) {
    const trigger = selectRoot.querySelector(".custom-select-trigger");
    const valueText = selectRoot.querySelector(".custom-select-value");
    const menu = selectRoot.querySelector(".custom-select-menu");

    let optionButtons = [];
    let onChangeCallback = null;

    function syncOptionState(isoCode) {
      let activeOption = optionButtons.find((option) => option.dataset.iso === isoCode);
      if (!activeOption) activeOption = optionButtons.find((opt) => opt.dataset.iso === "US") || optionButtons[0];

      optionButtons.forEach((option) => {
        option.classList.toggle("is-selected", option === activeOption);
      });

      if (activeOption) {
        valueText.innerHTML = activeOption.dataset.triggerLabel;
        countryCodeInput.value = activeOption.dataset.value;
        countryIsoInput.value = activeOption.dataset.iso;
      }
    }

    function setOptions(nextOptions) {
      menu.innerHTML = "";
      optionButtons = nextOptions.map((option) => {
        const optionButton = document.createElement("button");
        optionButton.type = "button";
        optionButton.className = "custom-select-option";
        optionButton.dataset.value = option.value;
        optionButton.dataset.iso = option.countryIso;
        optionButton.dataset.triggerLabel = option.triggerLabel;
        optionButton.innerHTML = option.optionLabel;
        return optionButton;
      });

      optionButtons.forEach((optionButton) => {
        optionButton.addEventListener("click", () => {
          syncOptionState(optionButton.dataset.iso);
          closeCustomSelect(selectRoot);
          if (onChangeCallback) {
            onChangeCallback(optionButton.dataset.value, optionButton.dataset.iso);
          }
        });
        menu.appendChild(optionButton);
      });
    }

    function setValue(isoCode, callOnChange) {
      syncOptionState(isoCode);
      if (callOnChange && onChangeCallback) {
        onChangeCallback(countryCodeInput.value, countryIsoInput.value);
      }
    }

    function setOnChange(callback) {
      onChangeCallback = callback;
    }

    trigger.addEventListener("click", () => {
      const isOpen = selectRoot.classList.contains("open");
      closeAllCustomSelects();
      if (!isOpen) {
        selectRoot.classList.add("open");
        trigger.setAttribute("aria-expanded", "true");
        visibleCustomSelect = selectRoot;
      }
    });

    return { setOptions, setValue, setOnChange };
  }

  document.addEventListener("click", (event) => {
    if (visibleCustomSelect && !visibleCustomSelect.contains(event.target)) {
      closeCustomSelect(visibleCustomSelect);
    }
  });

  /* Initialize Country Dropdown */
  const countrySelectRoot = document.querySelector('.custom-select[data-target-input="country-code"]');
  const countryController = initCustomSelect(countrySelectRoot);
  const countryOptions = getCountryOptions();
  countryController.setOptions(countryOptions);

  /* Check for saved country from earlier sign up steps */
  let initialIso = "US";
  const savedAccountData = JSON.parse(
    sessionStorage.getItem("makerpodsStudentAccountData") ||
    sessionStorage.getItem("makerpodsAdultAccountData") ||
    sessionStorage.getItem("makerpodsParentAccountData") ||
    "null"
  );
  if (savedAccountData && savedAccountData.countryOfOrigin) {
    initialIso = savedAccountData.countryOfOrigin;
  }

  countryController.setValue(initialIso, false);

  countryController.setOnChange(() => {
    updateSubmitState();
    phoneAreaCode.focus();
  });

  /* All number input boxes start completely BLANK */
  phoneAreaCode.value = "";
  phonePrefix.value = "";
  phoneLine.value = "";

  /* Check form validity and update submit glow */
  function updateSubmitState() {
    const area = phoneAreaCode.value.trim();
    const prefix = phonePrefix.value.trim();
    const line = phoneLine.value.trim();

    const isFullyFilled = area.length === 3 && prefix.length === 3 && line.length === 4;
    submitBtn.classList.toggle("is-ready", isFullyFilled);
  }

  /* Phone Inputs Logic - Auto Advance & Strict Numbers Only */
  phoneInputs.forEach((input, index) => {
    /* Prevent typing letters or non-numeric characters */
    input.addEventListener("keydown", (event) => {
      if (event.key === "Backspace") {
        if (!input.value && phoneInputs[index - 1]) {
          phoneInputs[index - 1].focus();
        }
        return;
      }

      /* Allow navigation keys, Tab, Enter */
      if (["Tab", "Enter", "ArrowLeft", "ArrowRight", "Delete"].includes(event.key)) {
        return;
      }

      /* Disallow letters and non-digits */
      if (!/^[0-9]$/.test(event.key) && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
      }
    });

    input.addEventListener("input", () => {
      /* Strip letters and illegal chars instantly */
      input.value = input.value.replace(/[^0-9]/g, "").slice(0, input.maxLength);

      /* Auto Advance to next section when filled */
      const isMax = input.value.length >= input.maxLength;
      if (isMax && phoneInputs[index + 1]) {
        phoneInputs[index + 1].focus();
      }

      updateSubmitState();
    });

    /* Handle Paste of full phone numbers */
    input.addEventListener("paste", (event) => {
      event.preventDefault();
      const pastedText = (event.clipboardData || window.clipboardData).getData("text") || "";
      const digitsOnly = pastedText.replace(/[^0-9]/g, "");

      if (!digitsOnly) return;

      if (digitsOnly.length >= 10) {
        const area = digitsOnly.slice(digitsOnly.length - 10, digitsOnly.length - 7);
        const pref = digitsOnly.slice(digitsOnly.length - 7, digitsOnly.length - 4);
        const lin = digitsOnly.slice(digitsOnly.length - 4);

        phoneAreaCode.value = area;
        phonePrefix.value = pref;
        phoneLine.value = lin;
        phoneLine.focus();
      } else {
        input.value = digitsOnly.slice(0, input.maxLength);
        if (input.value.length >= input.maxLength && phoneInputs[index + 1]) {
          phoneInputs[index + 1].focus();
        }
      }

      updateSubmitState();
    });
  });

  /* Navigation */
  backBtn.addEventListener("click", () => {
    goTo("../Sign Up Pt 3 (Email verification)/Sign Up Pt 3.html");
  });

  skipBtn.addEventListener("click", () => {
    sessionStorage.setItem("makerpodsPhoneData", JSON.stringify({ skipped: true }));
    goToIdVerification();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const area = phoneAreaCode.value.trim();
    const prefix = phonePrefix.value.trim();
    const line = phoneLine.value.trim();

    if (!area && !prefix && !line) {
      sessionStorage.setItem("makerpodsPhoneData", JSON.stringify({ skipped: true }));
      goToIdVerification();
      return;
    }

    if (area.length < 3) {
      phoneAreaCode.focus();
      return;
    }
    if (prefix.length < 3) {
      phonePrefix.focus();
      return;
    }
    if (line.length < 4) {
      phoneLine.focus();
      return;
    }

    const phoneData = {
      countryIso: countryIsoInput.value,
      countryCode: countryCodeInput.value,
      areaCode: area,
      prefix: prefix,
      line: line,
      fullNumber: `${countryCodeInput.value} (${area}) ${prefix}-${line}`
    };
    sessionStorage.setItem("makerpodsPhoneData", JSON.stringify(phoneData));
    goTo("../Sign Up Pt 4b (Phone number verification)/Sign Up Pt 4b.html");
  });

  updateSubmitState();
});
