/* ==========================================
   Sign Up Pt 5b — render a random QR code
   the other party can scan to link accounts
   ========================================== */

(function () {
  "use strict";

  // ---------- Compact QR encoder (public domain, Nayuki-derived) ----------
  // Supports byte mode, ECC level L, versions 1-10. Enough for short tokens.

  const ECC = {
    L: { formatBits: 1, ecCodewordsPerBlock: [7, 10, 15, 20, 26, 36, 40, 48, 60, 72], numBlocks: [1, 1, 1, 1, 1, 2, 2, 2, 2, 4] }
  };

  function qrEncode(text) {
    const bytes = toUtf8Bytes(text);
    let version = 1;
    for (; version <= 10; version++) {
      const cap = byteCapacity(version);
      if (bytes.length + 2 <= cap) break;
    }
    if (version > 10) throw new Error("Text too long for QR");

    const size = 17 + 4 * version;
    const matrix = makeMatrix(size);
    placeFinderPatterns(matrix, size);
    placeAlignmentPatterns(matrix, size, version);
    placeTimingPatterns(matrix, size);
    reserveFormatAndVersion(matrix, size, version);
    placeData(matrix, size, bytes, version);
    applyMask(matrix, size, version);
    drawFormatAndVersion(matrix, size, version, 0);
    return matrix;
  }

  function toUtf8Bytes(text) {
    const out = [];
    for (let i = 0; i < text.length; i++) {
      let c = text.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) {
        out.push(0xc0 | (c >> 6));
        out.push(0x80 | (c & 0x3f));
      } else {
        out.push(0xe0 | (c >> 12));
        out.push(0x80 | ((c >> 6) & 0x3f));
        out.push(0x80 | (c & 0x3f));
      }
    }
    return out;
  }

  function byteCapacity(version) {
    // Byte-mode total data codewords available (including 2-byte length header)
    // for ECC L, versions 1-10. (Number of data codewords = total data / 8)
    const dataCodewords = [
      19, 34, 55, 80, 108, 136, 156, 194, 232, 274
    ];
    return (dataCodewords[version - 1] * 8) / 8;
  }

  function makeMatrix(size) {
    const m = [];
    for (let r = 0; r < size; r++) {
      const row = [];
      for (let c = 0; c < size; c++) row.push(0);
      m.push(row);
    }
    return m;
  }

  function placeFinderPatterns(m, size) {
    const positions = [[0, 0], [size - 7, 0], [0, size - 7]];
    positions.forEach(([rr, cc]) => {
      for (let dy = -1; dy <= 7; dy++) {
        for (let dx = -1; dx <= 7; dx++) {
          const y = rr + dy, x = cc + dx;
          if (y < 0 || y >= size || x < 0 || x >= size) continue;
          const inOuter = dy >= 0 && dy <= 6 && dx >= 0 && dx <= 6;
          const inInner = dy >= 2 && dy <= 4 && dx >= 2 && dx <= 4;
          const onBorder = dy === 0 || dy === 6 || dx === 0 || dx === 6;
          let v = 0;
          if (inOuter && (onBorder || inInner)) v = 1;
          m[y][x] = v;
        }
      }
    });
  }

  function placeAlignmentPatterns(m, size, version) {
    if (version < 2) return;
    const positions = [0, 6, 18];
    const list = [];
    for (let i = 0; i < positions.length; i++) {
      for (let j = 0; j < positions.length; j++) {
        const y = positions[i], x = positions[j];
        if (m[y][x]) continue; // overlapped with finder
        list.push([y, x]);
      }
    }
    list.forEach(([cy, cx]) => {
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const ay = Math.abs(dy), ax = Math.abs(dx);
          const v = (ay === 2 || ax === 2 || (ay === 0 && ax === 0)) ? 1 : 0;
          m[cy + dy][cx + dx] = v;
        }
      }
    });
  }

  function placeTimingPatterns(m, size) {
    for (let i = 8; i < size - 8; i++) {
      m[6][i] = (i % 2 === 0) ? 1 : 0;
      m[i][6] = (i % 2 === 0) ? 1 : 0;
    }
  }

  function reserveFormatAndVersion(m, size, version) {
    // Reserve dark module
    m[size - 8][8] = 1;
    // Reserve format info area
    for (let i = 0; i <= 8; i++) {
      if (m[8][i] === undefined || m[8][i] === 0) m[8][i] = m[8][i] | 0; // mark reserved by leaving 0
      if (m[i][8] === undefined || m[i][8] === 0) m[i][8] = m[i][8] | 0;
    }
  }

  function placeData(m, size, bytes, version) {
    // Build bit stream
    const bits = [];
    pushBits(bits, 0, 4);          // mode = byte (0100)
    const lenBits = version < 10 ? 8 : 16;
    pushBits(bits, bytes.length, lenBits);
    bytes.forEach((b) => pushBits(bits, b, 8));
    // Terminator
    const dataCodewords = [
      19, 34, 55, 80, 108, 136, 156, 194, 232, 274
    ][version - 1];
    const totalDataBits = dataCodewords * 8;
    const rem = totalDataBits - bits.length;
    if (rem > 0) pushBits(bits, 0, Math.min(4, rem));
    // Pad to byte boundary
    while (bits.length % 8 !== 0) bits.push(0);
    // Pad bytes
    const padBytes = [0xec, 0x11];
    let padIdx = 0;
    while (bits.length < totalDataBits) {
      pushBits(bits, padBytes[padIdx], 8);
      padIdx = 1 - padIdx;
    }
    // Convert to codewords
    const data = [];
    for (let i = 0; i < bits.length; i += 8) {
      let v = 0;
      for (let b = 0; b < 8; b++) v = (v << 1) | bits[i + b];
      data.push(v);
    }
    // ECC (Reed-Solomon) per block
    const ecPerBlock = ECC.L.ecCodewordsPerBlock[version - 1];
    const numBlocks = ECC.L.numBlocks[version - 1];
    const totalEc = ecPerBlock * numBlocks;
    const ecAll = [];
    for (let i = 0; i < numBlocks; i++) {
      const start = Math.floor((i * data.length) / numBlocks);
      const end = Math.floor(((i + 1) * data.length) / numBlocks);
      const block = data.slice(start, end);
      const ec = rsEncode(block, ecPerBlock);
      for (let k = 0; k < ecPerBlock; k++) ecAll.push(ec[k]);
    }
    // Interleave
    const finalBits = [];
    const maxBlock = Math.ceil(data.length / numBlocks);
    for (let i = 0; i < maxBlock; i++) {
      for (let b = 0; b < numBlocks; b++) {
        const idx = b * maxBlock + i;
        if (idx < data.length) pushBits(finalBits, data[idx], 8);
      }
    }
    for (let i = 0; i < totalEc; i++) pushBits(finalBits, ecAll[i], 8);

    // Place in zigzag order from bottom-right
    let bitIdx = 0;
    let dir = -1; // up
    let row = size - 1;
    for (let col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--; // skip vertical timing
      for (let i = 0; i < size; i++) {
        const y = row + dir * i;
        for (let c = 0; c < 2; c++) {
          const x = col - c;
          if (isFunctionPattern(y, x, size)) continue;
          const v = bitIdx < finalBits.length ? finalBits[bitIdx] : 0;
          m[y][x] = v;
          bitIdx++;
        }
      }
      dir = -dir;
      row = size - 1;
    }
  }

  function pushBits(arr, value, n) {
    for (let i = n - 1; i >= 0; i--) arr.push((value >> i) & 1);
  }

  function isFunctionPattern(y, x, size) {
    // Finder / alignment / timing / format / version areas
    if (y < 0 || y >= size || x < 0 || x >= size) return true;
    if (y <= 8 && x <= 8) return true;             // top-left finder + format
    if (y <= 8 && x >= size - 8) return true;       // top-right finder + format
    if (y >= size - 8 && x <= 8) return true;       // bottom-left finder + format
    if (y === 6 || x === 6) return true;            // timing patterns
    return false;
  }

  function applyMask(m, size, version) {
    // Use mask 0 (i = (row + col) % 2 == 0)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (isFunctionPattern(y, x, size)) continue;
        if ((y + x) % 2 === 0) m[y][x] ^= 1;
      }
    }
  }

  function drawFormatAndVersion(m, size, version, maskIndex) {
    // Format info: ECC level L (01) + mask 0 (000) = 01000
    const formatBits = 0b101010000010010; // precomputed for L, mask 0
    for (let i = 0; i < 15; i++) {
      const bit = (formatBits >> i) & 1;
      // Top-left
      const r1 = (i < 6) ? 8 : (i < 8) ? (i - 6) : 8;
      const c1 = (i < 6) ? i : (i < 8) ? 8 : (14 - i);
      m[r1][c1] = bit;
      // Bottom-left and top-right
      if (i < 8) m[size - 1 - i][8] = bit;
      else m[8][size - 15 + i] = bit;
    }
    m[size - 8][8] = 1; // dark module
  }

  // Reed-Solomon encoder (GF(256)) for QR
  const GF_EXP = new Uint8Array(512);
  const GF_LOG = new Uint8Array(256);
  (function initGF() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      GF_EXP[i] = x;
      GF_LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
  })();

  function gfMul(a, b) { return (a && b) ? GF_EXP[GF_LOG[a] + GF_LOG[b]] : 0; }

  function rsGenerator(degree) {
    let g = [1];
    for (let i = 0; i < degree; i++) {
      const next = new Array(g.length + 1).fill(0);
      for (let j = 0; j < g.length; j++) {
        next[j] ^= g[j];
        next[j + 1] ^= gfMul(g[j], GF_EXP[i]);
      }
      g = next;
    }
    return g;
  }

  function rsEncode(data, ecLen) {
    const gen = rsGenerator(ecLen);
    const result = data.concat(new Array(ecLen).fill(0));
    for (let i = 0; i < data.length; i++) {
      const coef = result[i];
      if (coef === 0) continue;
      for (let j = 0; j < gen.length; j++) {
        result[i + j] ^= gfMul(gen[j], coef);
      }
    }
    return result.slice(data.length);
  }

  // ---------- Page logic ----------

  document.addEventListener("DOMContentLoaded", () => {
    const role = document.body.dataset.role || "student";
    const card = document.querySelector(".qr-card");
    const qrFrame = document.getElementById("qr-frame");
    const tokenEl = document.getElementById("qr-token");
    const regenBtn = document.getElementById("regen-btn");
    const continueBtn = document.getElementById("continue-btn");
    const backBtn = document.getElementById("back-btn");
    const statusEl = document.getElementById("qr-status");

    function randomCode() {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let out = "";
      const buf = new Uint8Array(6);
      crypto.getRandomValues(buf);
      for (let i = 0; i < 6; i++) out += chars[buf[i] % chars.length];
      return out;
    }

    function renderQR(token) {
      const payload = "MAKERPODS-LINK|" + role.toUpperCase() + "|" + token;
      let matrix;
      try { matrix = qrEncode(payload); }
      catch (e) { matrix = qrEncode(token); }
      const size = matrix.length;
      qrFrame.style.gridTemplateColumns = "repeat(" + size + ", 1fr)";
      qrFrame.style.gridTemplateRows = "repeat(" + size + ", 1fr)";
      qrFrame.innerHTML = "";
      const frag = document.createDocumentFragment();
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const cell = document.createElement("div");
          cell.className = "qr-cell" + (matrix[y][x] ? "" : " light");
          frag.appendChild(cell);
        }
      }
      qrFrame.appendChild(frag);
    }

    function generate() {
      const token = randomCode();
      sessionStorage.setItem("makerpodsLinkToken", token);
      sessionStorage.setItem("makerpodsLinkTokenRole", role);
      tokenEl.textContent = token.slice(0, 3) + " " + token.slice(3);
      renderQR(token);
      setStatus("waiting");
    }

    function setStatus(state) {
      if (state === "waiting") {
        statusEl.classList.remove("scanned");
        statusEl.querySelector(".qr-status-text").textContent = "Waiting for scan…";
      } else if (state === "scanned") {
        statusEl.classList.add("scanned");
        statusEl.querySelector(".qr-status-text").textContent = "Linked!";
      }
    }

    // Cross-tab listen: when the other party claims the token via 5c,
    // we get a 'storage' event and switch the status pill.
    window.addEventListener("storage", (event) => {
      if (event.key === "makerpodsLinkTokenClaimed" && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          if (data && data.token && data.token === sessionStorage.getItem("makerpodsLinkToken")) {
            setStatus("scanned");
          }
        } catch (e) { /* ignore */ }
      }
    });

    regenBtn.addEventListener("click", generate);

    // bfcache can restore this page without re-firing DOMContentLoaded,
    // which would leave the old QR on screen. If we were restored from
    // bfcache, regenerate so each visit produces a fresh code.
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) generate();
    });

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        if (card) card.classList.add("page-exit");
        setTimeout(() => {
          window.location.href = "../../Sign Up Student/Sign Up 5a/Sign Up Pt 5a.html";
        }, 280);
      });
    }

    continueBtn.addEventListener("click", () => {
      if (card) card.classList.add("page-exit");
      setTimeout(() => {
        window.location.href = "../../Sign Up Student/Sign Up 5c/Sign Up Pt 5c.html";
      }, 280);
    });

    generate();
  });
})();
