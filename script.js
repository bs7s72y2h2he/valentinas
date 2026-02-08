const cardsData = [
  "Tavo sypsena padaro diena sviesesne",
  "Tu moki nusijuokti is smulkmenu",
  "Tavo apkabinimai yra mano ramybe",
  "Tu kuri musu saugia erdve",
  "Su tavimi viskas tampa nuotykis",
  "Tavo akys pasako daugiau nei zodziai",
  "Tu visada pastebi mazus dalykus",
  "Tu moki klausytis ir girdeti",
  "Tu esi mano drasa",
  "Tu esi mano ramybe",
  "Tu esi mano megstamiausias zmogus",
  "Tu esi mano siandien ir rytoj"
];

const cardsGrid = document.getElementById("cards-grid");
const scoreValue = document.getElementById("score-value");
const shuffleButton = document.getElementById("shuffle-cards");
const heartsContainer = document.querySelector(".background-hearts");
const brightnessSlider = document.getElementById("heart-brightness");
const speedSlider = document.getElementById("heart-speed");
const heartToggle = document.getElementById("heart-toggle");
const heartClose = document.getElementById("heart-close");
const gate = document.getElementById("gate");
const gateForm = document.getElementById("gate-form");
const gateDateInput = document.getElementById("gate-date");
const gateError = document.getElementById("gate-error");
const celebration = document.getElementById("celebration");

let score = 0;
const targetDate = { year: 2025, month: 7, day: 31 };
const celebrationDuration = 2200;
const unlockCacheKey = "valentinoUnlock";
const unlockTtlMs = 10 * 60 * 1000;
const scratchRadius = 18;
let audioContext;

const playRevealSound = () => {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gainNode.gain.value = 0.06;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.12
    );
    oscillator.stop(audioContext.currentTime + 0.13);
  } catch (error) {
    // Ignore audio errors (autoplay restrictions, unsupported API)
  }
};

const createCard = (text) => {
  const card = document.createElement("div");
  card.className = "card";
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", "Nutrinti kortele");

  const content = document.createElement("div");
  content.className = "card__content";
  content.textContent = text;

  const canvas = document.createElement("canvas");
  canvas.className = "card__scratch";
  canvas.setAttribute("aria-hidden", "true");

  card.append(content, canvas);

  return card;
};

const setupScratchCanvas = (card, canvas) => {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return;

  const drawOverlay = () => {
    const rect = card.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;

    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    context.globalCompositeOperation = "source-over";
    context.fillStyle = "#f36f7f";
    context.fillRect(0, 0, rect.width, rect.height);

    context.fillStyle = "rgba(255, 255, 255, 0.25)";
    for (let i = 0; i < 18; i += 1) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const r = 3 + Math.random() * 4;
      context.beginPath();
      context.arc(x, y, r, 0, Math.PI * 2);
      context.fill();
    }

    context.globalCompositeOperation = "destination-out";
  };

  drawOverlay();

  let isDrawing = false;

  const scratchAt = (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    context.beginPath();
    context.arc(x, y, scratchRadius, 0, Math.PI * 2);
    context.fill();
  };

  const checkReveal = () => {
    if (card.classList.contains("is-revealed")) return;
    const { width, height } = canvas;
    const imageData = context.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    const step = 24;
    let cleared = 0;
    let total = 0;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4 + 3;
        total += 1;
        if (pixels[index] < 12) cleared += 1;
      }
    }

    if (cleared / total > 0.25) {
      card.classList.add("is-revealed");
      score += 1;
      scoreValue.textContent = score.toString();
      playRevealSound();
      context.clearRect(0, 0, width, height);
    }
  };

  const startScratch = (event) => {
    isDrawing = true;
    canvas.setPointerCapture(event.pointerId);
    scratchAt(event);
  };

  let revealTimer;
  const scheduleRevealCheck = () => {
    if (revealTimer) return;
    revealTimer = window.setTimeout(() => {
      revealTimer = null;
      checkReveal();
    }, 180);
  };

  const moveScratch = (event) => {
    if (!isDrawing) return;
    scratchAt(event);
    scheduleRevealCheck();
  };

  const endScratch = (event) => {
    if (!isDrawing) return;
    isDrawing = false;
    canvas.releasePointerCapture(event.pointerId);
    checkReveal();
  };

  canvas.addEventListener("pointerdown", startScratch);
  canvas.addEventListener("pointermove", moveScratch);
  canvas.addEventListener("pointerup", endScratch);
  canvas.addEventListener("pointercancel", endScratch);

  window.addEventListener("resize", () => {
    if (!card.classList.contains("is-revealed")) {
      drawOverlay();
    }
  });
};

const renderCards = (data) => {
  cardsGrid.innerHTML = "";
  data.forEach((text) => {
    const card = createCard(text);
    cardsGrid.append(card);
    const canvas = card.querySelector(".card__scratch");
    if (canvas) {
      setupScratchCanvas(card, canvas);
    }
  });
};

const shuffleCards = () => {
  const shuffled = [...cardsData].sort(() => Math.random() - 0.5);
  score = 0;
  scoreValue.textContent = "0";
  renderCards(shuffled);
};


shuffleButton.addEventListener("click", shuffleCards);

renderCards(cardsData);

document.querySelectorAll(".memory-box").forEach((box) => {
  const lid = box.querySelector(".memory-box__lid");
  lid?.addEventListener("click", () => {
    box.classList.toggle("is-open");
  });
});

const createFloatingHearts = (count) => {
  if (!heartsContainer) return;
  heartsContainer.innerHTML = "";

  for (let index = 0; index < count; index += 1) {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = "\u2665";

    const size = 16 + Math.random() * 24;
    const duration = 12 + Math.random() * 16;
    const delay = -Math.random() * duration;
    const left = Math.random() * 100;

    heart.style.setProperty("--size", `${size}px`);
    heart.style.setProperty("--duration", `${duration}s`);
    heart.style.left = `${left}vw`;
    heart.style.animationDelay = `${delay}s`;

    heartsContainer.append(heart);
  }
};

const updateHeartControls = () => {
  if (!heartsContainer) return;
  if (brightnessSlider) {
    heartsContainer.style.setProperty("--heart-opacity", brightnessSlider.value);
  }
  if (speedSlider) {
    heartsContainer.style.setProperty("--heart-speed", speedSlider.value);
  }
};

const getHeartCount = () => (window.innerWidth <= 600 ? 16 : 28);

const refreshHearts = () => {
  createFloatingHearts(getHeartCount());
  updateHeartControls();
};

refreshHearts();

if (brightnessSlider) {
  brightnessSlider.addEventListener("input", updateHeartControls);
}


if (speedSlider) {
  speedSlider.addEventListener("input", updateHeartControls);
}

if (heartToggle) {
  heartToggle.addEventListener("click", () => {
    heartToggle.closest(".heart-controls")?.classList.toggle("is-collapsed");
  });
}

if (heartClose) {
  heartClose.addEventListener("click", () => {
    heartClose.closest(".heart-controls")?.classList.add("is-collapsed");
  });
}

updateHeartControls();

const unlockPage = () => {
  document.body.classList.add("is-celebrating");
  gate?.classList.add("is-hidden");
  celebration?.classList.add("is-visible");
  createFloatingHearts(64);

  try {
    const payload = { unlockedAt: Date.now() };
    localStorage.setItem(unlockCacheKey, JSON.stringify(payload));
  } catch (error) {
    // Ignore storage errors (private mode, blocked storage, etc.)
  }

  window.setTimeout(() => {
    document.body.classList.remove("is-celebrating");
    document.body.classList.remove("is-locked");
    celebration?.classList.remove("is-visible");
    refreshHearts();
  }, celebrationDuration);
};

const shouldAutoUnlock = () => {
  try {
    const raw = localStorage.getItem(unlockCacheKey);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!parsed?.unlockedAt) return false;
    return Date.now() - parsed.unlockedAt < unlockTtlMs;
  } catch (error) {
    return false;
  }
};

const isValidDate = ({ year, month, day }) => {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const parseDateParts = (value) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const digitsOnly = trimmed.replace(/\D/g, "");
  if (digitsOnly.length === 8) {
    const firstFour = Number(digitsOnly.slice(0, 4));
    const lastFour = Number(digitsOnly.slice(4));

    if (firstFour >= 1900) {
      const year = firstFour;
      const month = Number(digitsOnly.slice(4, 6));
      const day = Number(digitsOnly.slice(6, 8));
      return isValidDate({ year, month, day }) ? { year, month, day } : null;
    }

    if (lastFour >= 1900) {
      const year = lastFour;
      const day = Number(digitsOnly.slice(0, 2));
      const month = Number(digitsOnly.slice(2, 4));
      return isValidDate({ year, month, day }) ? { year, month, day } : null;
    }
  }

  const parts = trimmed.split(/\D+/).filter(Boolean);
  if (parts.length !== 3) return null;

  const [first, second, third] = parts.map(Number);
  if ([first, second, third].some((part) => Number.isNaN(part))) return null;

  let year;
  let month;
  let day;

  if (parts[0].length === 4) {
    year = first;
    month = second;
    day = third;
  } else if (parts[2].length === 4) {
    year = third;

    if (first <= 12 && second <= 12) {
      month = first;
      day = second;
    } else if (first > 12) {
      day = first;
      month = second;
    } else {
      day = first;
      month = second;
    }
  } else {
    return null;
  }

  return isValidDate({ year, month, day }) ? { year, month, day } : null;
};

const matchesTargetDate = (parts) =>
  parts &&
  parts.year === targetDate.year &&
  parts.month === targetDate.month &&
  parts.day === targetDate.day;

if (gateForm) {
  gateForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!gateDateInput) return;

    const partsFromText = parseDateParts(gateDateInput.value);
    const partsFromPicker = gateDateInput.valueAsDate
      ? {
          year: gateDateInput.valueAsDate.getUTCFullYear(),
          month: gateDateInput.valueAsDate.getUTCMonth() + 1,
          day: gateDateInput.valueAsDate.getUTCDate()
        }
      : null;

    const parts = partsFromText || partsFromPicker;
    const digits = gateDateInput.value.replace(/\D/g, "");
    const matchesByDigits =
      digits === "20250731" || digits === "31072025" || digits === "07312025";

    if (!parts && !matchesByDigits) {
      if (gateError) {
        gateError.textContent = "Ivesk data (YYYY-MM-DD arba 31.07.2025).";
      }
      return;
    }

    if (matchesByDigits || matchesTargetDate(parts)) {
      if (gateError) gateError.textContent = "";
      unlockPage();
    } else if (gateError) {
      gateError.textContent = "Netinkama data. Pabandyk dar.";
    }
  });
}

if (shouldAutoUnlock()) {
  gate?.classList.add("is-hidden");
  document.body.classList.remove("is-locked");
}

window.addEventListener("resize", () => {
  refreshHearts();
});
