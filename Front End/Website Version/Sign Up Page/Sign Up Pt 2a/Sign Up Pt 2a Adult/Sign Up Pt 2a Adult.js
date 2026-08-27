document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("parent-legal-form");
  const firstNameInput = document.getElementById("first-name");
  const lastNameInput = document.getElementById("last-name");
  const genderSelect = document.getElementById("gender");
  const dobInput = document.getElementById("dob");
  const countryOriginInput = document.getElementById("country-origin");
  const dobMonthInput = document.getElementById("dob-month");
  const dobDayInput = document.getElementById("dob-day");
  const dobYearInput = document.getElementById("dob-year");
  const dobSelectorsContainer = document.getElementById("dob-selectors");
  const dobFormatHint = document.getElementById("dob-format-hint");
  const submitBtn = document.getElementById("adult-submit-btn");
  const backBtn = document.getElementById("back-btn");
  const ageErrorSpan = document.getElementById("age-error");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const themeIcon = document.getElementById("theme-icon");
  const transparencyToggleBtn = document.getElementById("transparency-toggle-btn");
  const transparencyIcon = document.getElementById("transparency-icon");
  const htmlElement = document.documentElement;
  function goTo(url) {
    const container = document.querySelector(".signup-container");
    if (!container) { window.location.href = url; return; }
    container.classList.add("page-exit");
    setTimeout(() => { window.location.href = url; }, 320);
  }
  const today = new Date();
  const selectControllers = new Map();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const allCountryCodes = ["AD","AE","AF","AG","AI","AL","AM","AO","AQ","AR","AS","AT","AU","AW","AX","AZ","BA","BB","BD","BE","BF","BG","BH","BI","BJ","BL","BM","BN","BO","BQ","BR","BS","BT","BV","BW","BY","BZ","CA","CC","CD","CF","CG","CH","CI","CK","CL","CM","CN","CO","CR","CU","CV","CW","CX","CY","CZ","DE","DJ","DK","DM","DO","DZ","EC","EE","EG","EH","ER","ES","ET","FI","FJ","FK","FM","FO","FR","GA","GB","GD","GE","GF","GG","GH","GI","GL","GM","GN","GP","GQ","GR","GS","GT","GU","GW","GY","HK","HM","HN","HR","HT","HU","ID","IE","IL","IM","IN","IO","IQ","IR","IS","IT","JE","JM","JO","JP","KE","KG","KH","KI","KM","KN","KP","KR","KW","KY","KZ","LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY","MA","MC","MD","ME","MF","MG","MH","MK","ML","MM","MN","MO","MP","MQ","MR","MS","MT","MU","MV","MW","MX","MY","MZ","NA","NC","NE","NF","NG","NI","NL","NO","NP","NR","NU","NZ","OM","PA","PE","PF","PG","PH","PK","PL","PM","PN","PR","PS","PT","PW","PY","QA","RE","RO","RS","RU","RW","SA","SB","SC","SD","SE","SG","SH","SI","SJ","SK","SL","SM","SN","SO","SR","SS","ST","SV","SX","SY","SZ","TC","TD","TF","TG","TH","TJ","TK","TL","TM","TN","TO","TR","TT","TV","TW","TZ","UA","UG","UM","US","UY","UZ","VA","VC","VE","VG","VI","VN","VU","WF","WS","YE","YT","ZA","ZM","ZW"];
  const SUN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  const MOON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  const CLEAR_SQ_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>`;
  const SOLID_SQ_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>`;
  const ymdCountries = new Set(["CN", "HU", "IR", "JP", "KR", "LT", "MN", "TW"]);
  const mdyCountries = new Set(["US", "BZ", "FM", "PH", "PW"]);
  const draftKey = "makerpodsAdultLegalDraft";
  const nextRoute = "../../Sign Up Pt 2b/Sign Up Pt 2b Adult/Sign Up Pt 2b Adult.html";

  today.setHours(0, 0, 0, 0);

  let visibleCustomSelect = null;

  function dispatchFieldUpdate(input) {
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function saveDraft() {
    const draft = {};
    form.querySelectorAll("input").forEach((input) => {
      if (input.id) draft[input.id] = input.value;
    });
    sessionStorage.setItem(draftKey, JSON.stringify(draft));
  }

  function restoreDraft() {
    const draft = JSON.parse(sessionStorage.getItem(draftKey) || "null");
    if (!draft) return;
    Object.entries(draft).forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (!input) return;
      input.value = value;
      selectControllers.get(id)?.setValue(value, false, false);
    });
    dispatchFieldUpdate(dobInput);
  }

  function updateThemeIcon(theme) {
    if (!themeIcon) {
      return;
    }
    themeIcon.innerHTML = theme === "dark" ? SUN_SVG : MOON_SVG;
  }

  function applySavedTheme() {
    const savedTheme = localStorage.getItem("makerpodsTheme");
    const preferredTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    htmlElement.setAttribute("data-theme", preferredTheme);
    updateThemeIcon(preferredTheme);
  }

  function updateTransparencyIcon(mode) {
    if (!transparencyIcon) {
      return;
    }
    transparencyIcon.innerHTML = mode === "transparent" ? CLEAR_SQ_SVG : SOLID_SQ_SVG;
  }

  function applySavedSurfaceMode() {
    const savedMode = localStorage.getItem("makerpodsSurfaceMode");
    const preferredMode = savedMode === "solid" || savedMode === "transparent" ? savedMode : "transparent";
    htmlElement.setAttribute("data-surface-mode", preferredMode);
    updateTransparencyIcon(preferredMode);
  }

  function closeCustomSelect(selectRoot) {
    selectRoot.classList.remove("open");
    const trigger = selectRoot.querySelector(".custom-select-trigger");
    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
    }
    if (visibleCustomSelect === selectRoot) {
      visibleCustomSelect = null;
    }
  }

  function closeAllCustomSelects() {
    document.querySelectorAll(".custom-select.open").forEach((selectRoot) => closeCustomSelect(selectRoot));
  }

  function createCustomOptionButton(option) {
    const optionButton = document.createElement("button");
    optionButton.type = "button";
    optionButton.className = "custom-select-option";
    optionButton.dataset.value = option.value;
    optionButton.innerHTML = option.label;
    return optionButton;
  }

  function initCustomSelect(selectRoot) {
    const targetInputId = selectRoot.getAttribute("data-target-input");
    const targetInput = document.getElementById(targetInputId);
    const trigger = selectRoot.querySelector(".custom-select-trigger");
    const valueText = selectRoot.querySelector(".custom-select-value");
    const menu = selectRoot.querySelector(".custom-select-menu");

    let optionButtons = [];
    let onChangeCallback = null;

    function syncOptionState(nextValue) {
      let activeOption = optionButtons.find((option) => option.dataset.value === nextValue);
      if (!activeOption) {
        activeOption = optionButtons[0] || null;
      }

      optionButtons.forEach((option) => {
        option.classList.toggle("is-selected", option === activeOption);
      });

      if (activeOption) {
        valueText.innerHTML = activeOption.innerHTML;
        targetInput.value = activeOption.dataset.value;
      }
    }

    function setOptions(nextOptions) {
      menu.innerHTML = "";
      optionButtons = nextOptions.map((option) => createCustomOptionButton(option));
      optionButtons.forEach((optionButton) => {
        optionButton.addEventListener("click", () => {
          syncOptionState(optionButton.dataset.value);
          closeCustomSelect(selectRoot);
          dispatchFieldUpdate(targetInput);
          if (onChangeCallback) {
            onChangeCallback(targetInput.value);
          }
        });
        menu.appendChild(optionButton);
      });
      syncOptionState(targetInput.value);
    }

    function setValue(value, emitEvents, callOnChange) {
      syncOptionState(value);
      if (emitEvents) {
        dispatchFieldUpdate(targetInput);
      }
      if (callOnChange && onChangeCallback) {
        onChangeCallback(targetInput.value);
      }
    }

    function setOnChange(callback) {
      onChangeCallback = callback;
    }

    const initialOptions = Array.from(menu.querySelectorAll(".custom-select-option")).map((option) => ({
      value: option.dataset.value || "",
      label: option.textContent.trim()
    }));

    setOptions(initialOptions);

    trigger.addEventListener("click", () => {
      const isOpen = selectRoot.classList.contains("open");
      closeAllCustomSelects();
      if (!isOpen) {
        selectRoot.classList.add("open");
        trigger.setAttribute("aria-expanded", "true");
        visibleCustomSelect = selectRoot;
      }
    });

    const controller = {
      targetInput,
      setOptions,
      setValue,
      setOnChange,
      getValue: () => targetInput.value
    };

    selectControllers.set(targetInputId, controller);
    return controller;
  }

  function formatDateForInput(year, month, day) {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function getDateOrderForCountry(countryCode) {
    if (ymdCountries.has(countryCode)) {
      return "YMD";
    }
    if (mdyCountries.has(countryCode)) {
      return "MDY";
    }
    return "DMY";
  }

  function applyDobFormatOrder(order) {
    const orderMap = {
      MDY: { month: 1, day: 2, year: 3, hint: "Format: MM / DD / YYYY" },
      DMY: { month: 2, day: 1, year: 3, hint: "Format: DD / MM / YYYY" },
      YMD: { month: 2, day: 3, year: 1, hint: "Format: YYYY / MM / DD" }
    };

    const formatSettings = orderMap[order] || orderMap.MDY;
    const monthGroup = dobSelectorsContainer.querySelector('[data-part="month"]');
    const dayGroup = dobSelectorsContainer.querySelector('[data-part="day"]');
    const yearGroup = dobSelectorsContainer.querySelector('[data-part="year"]');

    monthGroup.style.order = String(formatSettings.month);
    dayGroup.style.order = String(formatSettings.day);
    yearGroup.style.order = String(formatSettings.year);
    dobFormatHint.textContent = formatSettings.hint;
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function setDateIfValid(yearValue, monthValue, dayValue) {
    if (!yearValue || !monthValue || !dayValue) {
      dobInput.value = "";
      return false;
    }

    const year = Number(yearValue);
    const month = Number(monthValue);
    const day = Number(dayValue);
    const candidateDate = new Date(year, month - 1, day);
    candidateDate.setHours(0, 0, 0, 0);

    if (
      Number.isNaN(candidateDate.getTime()) ||
      candidateDate.getFullYear() !== year ||
      candidateDate.getMonth() !== month - 1 ||
      candidateDate.getDate() !== day ||
      candidateDate > today
    ) {
      dobInput.value = "";
      return false;
    }

    dobInput.value = formatDateForInput(year, month, day);
    return true;
  }

  function refreshDayOptions(preserveSelection) {
    const monthController = selectControllers.get("dob-month");
    const dayController = selectControllers.get("dob-day");
    const yearController = selectControllers.get("dob-year");
    const monthValue = Number(monthController.getValue());
    const yearValue = Number(yearController.getValue());
    const previousDay = preserveSelection ? dayController.getValue() : "";
    const hasMonthYear = monthValue && yearValue;
    const maxDay = hasMonthYear ? getDaysInMonth(yearValue, monthValue) : 31;

    const dayOptions = [{ value: "", label: "Day" }];
    for (let day = 1; day <= maxDay; day++) {
      dayOptions.push({ value: String(day), label: String(day) });
    }

    dayController.setOptions(dayOptions);
    if (previousDay && Number(previousDay) <= maxDay) {
      dayController.setValue(previousDay, false, false);
    } else {
      dayController.setValue("", false, false);
    }
  }

  function toFlagHtml(countryCode) {
    if (!/^[A-Z]{2}$/.test(countryCode)) return "";
    return `<span class="fi fi-${countryCode.toLowerCase()}"></span>`;
  }

  function getCountryOptions() {
    const displayNames = typeof Intl.DisplayNames === "function"
      ? new Intl.DisplayNames(["en"], { type: "region" })
      : null;

    const options = allCountryCodes
      .map((code) => {
        const countryName = displayNames ? displayNames.of(code) : code;
        return {
          value: code,
          name: countryName || code
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((option) => ({
        value: option.value,
        label: `${toFlagHtml(option.value)} ${option.name}`
      }));
    const usIndex = options.findIndex((option) => option.value === "US");
    if (usIndex > 0) {
      const [usOption] = options.splice(usIndex, 1);
      options.unshift(usOption);
    }

    return options;
  }

  function initializeDateSelectorsAndCountry() {
    const countryController = selectControllers.get("country-origin");
    const dobMonthController = selectControllers.get("dob-month");
    const dobDayController = selectControllers.get("dob-day");
    const dobYearController = selectControllers.get("dob-year");

    const monthOptions = [{ value: "", label: "Month" }];
    for (let month = 1; month <= 12; month++) {
      monthOptions.push({ value: String(month), label: monthNames[month - 1] });
    }

    const yearOptions = [{ value: "", label: "Year" }];
    for (let year = today.getFullYear(); year >= today.getFullYear() - 120; year--) {
      yearOptions.push({ value: String(year), label: String(year) });
    }

    const countryOptions = getCountryOptions();
    countryController.setOptions(countryOptions);
    countryController.setValue("US", false, false);
    dobMonthController.setOptions(monthOptions);
    dobYearController.setOptions(yearOptions);
    refreshDayOptions(false);
    applyDobFormatOrder(getDateOrderForCountry("US"));

    countryController.setOnChange((countryCode) => {
      applyDobFormatOrder(getDateOrderForCountry(countryCode));
      checkFormValidity();
    });

    dobMonthController.setOnChange(() => {
      refreshDayOptions(true);
      setDateIfValid(dobYearInput.value, dobMonthInput.value, dobDayInput.value);
      checkFormValidity();
    });

    dobDayController.setOnChange(() => {
      setDateIfValid(dobYearInput.value, dobMonthInput.value, dobDayInput.value);
      checkFormValidity();
    });

    dobYearController.setOnChange(() => {
      refreshDayOptions(true);
      setDateIfValid(dobYearInput.value, dobMonthInput.value, dobDayInput.value);
      checkFormValidity();
    });
  }

  function validateAge(dobString) {
    const dob = new Date(dobString);
    const now = new Date();

    let age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  function checkFormValidity() {
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const dobValue = dobInput.value;
    const genderValue = genderSelect.value;
    const countryValue = countryOriginInput.value;

    let isValid = Boolean(firstName && lastName && dobValue && genderValue && countryValue);

    if (dobValue) {
      const age = validateAge(dobValue);
      if (age < 18) {
        ageErrorSpan.style.display = "block";
        dobSelectorsContainer.classList.add("error");
        isValid = false;
      } else {
        ageErrorSpan.style.display = "none";
        dobSelectorsContainer.classList.remove("error");
      }
    } else {
      ageErrorSpan.style.display = "none";
      dobSelectorsContainer.classList.remove("error");
    }

    submitBtn.disabled = !isValid;
  }

  document.querySelectorAll(".custom-select").forEach((customSelect) => {
    initCustomSelect(customSelect);
  });

  initializeDateSelectorsAndCountry();
  restoreDraft();
  checkFormValidity();

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

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      goTo("../../Sign Up Pt 1 (Main Menu)/Sign Up Pt 1.html");
    });
  }

  document.addEventListener("click", (event) => {
    if (visibleCustomSelect && !visibleCustomSelect.contains(event.target)) {
      closeCustomSelect(visibleCustomSelect);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllCustomSelects();
    }
  });

  [firstNameInput, lastNameInput, dobInput, genderSelect, countryOriginInput].forEach((input) => {
    input.addEventListener("input", checkFormValidity);
    input.addEventListener("change", checkFormValidity);
    input.addEventListener("input", saveDraft);
    input.addEventListener("change", saveDraft);
  });

  form.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", saveDraft);
    input.addEventListener("change", saveDraft);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const adultData = {
      prefix: document.getElementById("prefix").value,
      firstName: firstNameInput.value.trim(),
      middleName: document.getElementById("middle-name").value.trim(),
      lastName: lastNameInput.value.trim(),
      suffix: document.getElementById("suffix").value,
      dob: dobInput.value,
      countryOfOrigin: countryOriginInput.value,
      gender: genderSelect.value,
      role: "adult",
      verificationStatus: "not_required",
      createdAt: new Date().toISOString()
    };

    sessionStorage.setItem("makerpodsUserRole", "adult");
    sessionStorage.setItem("makerpodsAdultLegalData", JSON.stringify(adultData));
    console.log("Adult legal data captured securely:", adultData);
    goTo(nextRoute);
  });
});
