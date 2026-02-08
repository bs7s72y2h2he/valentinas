const cardsData = [
  "Tavo sypsena padaro diena sviesesne",
  "Tu moki nusijuokti is smulkmenu",
  "Tavo rankos visada silto namu jausmo",
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
const revealButton = document.getElementById("reveal-all");
const heartsContainer = document.querySelector(".background-hearts");
const brightnessSlider = document.getElementById("heart-brightness");
const brightnessBoostSlider = document.getElementById("heart-brightness-boost");
const speedSlider = document.getElementById("heart-speed");
const heartToggle = document.getElementById("heart-toggle");
const gate = document.getElementById("gate");
const gateForm = document.getElementById("gate-form");
const gateDateInput = document.getElementById("gate-date");
const gateError = document.getElementById("gate-error");
const celebration = document.getElementById("celebration");

let score = 0;
const targetDate = { year: 2025, month: 7, day: 31 };
const celebrationDuration = 2200;

const createCard = (text) => {
  const card = document.createElement("button");
  card.className = "card";
  card.type = "button";
  card.setAttribute("aria-label", "Atversti kortele");

  const inner = document.createElement("div");
  inner.className = "card__inner";

  const front = document.createElement("div");
  front.className = "card__face card__face--front";
  front.innerHTML = '<span class="card__icon">\u2665</span>';

  const back = document.createElement("div");
  back.className = "card__face card__face--back";
  back.textContent = text;

  inner.append(front, back);
  card.append(inner);

  card.addEventListener("click", () => {
    if (card.classList.contains("is-flipped")) {
      card.classList.remove("is-flipped");
      score = Math.max(0, score - 1);
    } else {
      card.classList.add("is-flipped");
      score += 1;
    }
    scoreValue.textContent = score.toString();
  });

  return card;
};

const renderCards = (data) => {
  cardsGrid.innerHTML = "";
  data.forEach((text) => {
    cardsGrid.append(createCard(text));
  });
};

const shuffleCards = () => {
  const shuffled = [...cardsData].sort(() => Math.random() - 0.5);
  score = 0;
  scoreValue.textContent = "0";
  renderCards(shuffled);
};

const revealAll = () => {
  const allCards = cardsGrid.querySelectorAll(".card");
  score = allCards.length;
  scoreValue.textContent = score.toString();
  allCards.forEach((card) => card.classList.add("is-flipped"));
};

shuffleButton.addEventListener("click", shuffleCards);
revealButton.addEventListener("click", revealAll);

renderCards(cardsData);

const createFloatingHearts = (count) => {
  if (!heartsContainer) return;
  heartsContainer.innerHTML = "";

  for (let index = 0; index < count; index += 1) {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = "\u2665";

    const size = 12 + Math.random() * 20;
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

const getHeartCount = () => (window.innerWidth <= 600 ? 16 : 28);

const refreshHearts = () => {
  createFloatingHearts(getHeartCount());
  updateHeartControls();
};

refreshHearts();

const updateHeartControls = () => {
  if (!heartsContainer) return;
  if (brightnessSlider) {
    heartsContainer.style.setProperty("--heart-opacity", brightnessSlider.value);
  }
  if (brightnessBoostSlider) {
    heartsContainer.style.setProperty(
      "--heart-brightness",
      brightnessBoostSlider.value
    );
  }
  if (speedSlider) {
    heartsContainer.style.setProperty("--heart-speed", speedSlider.value);
  }
};

if (brightnessSlider) {
  brightnessSlider.addEventListener("input", updateHeartControls);
}

if (brightnessBoostSlider) {
  brightnessBoostSlider.addEventListener("input", updateHeartControls);
}

if (speedSlider) {
  speedSlider.addEventListener("input", updateHeartControls);
}

if (heartToggle) {
  heartToggle.addEventListener("click", () => {
    heartToggle.closest(".heart-controls")?.classList.toggle("is-collapsed");
  });
}

updateHeartControls();

const unlockPage = () => {
  document.body.classList.add("is-celebrating");
  gate?.classList.add("is-hidden");
  celebration?.classList.add("is-visible");
  createFloatingHearts(64);

  window.setTimeout(() => {
    document.body.classList.remove("is-celebrating");
    document.body.classList.remove("is-locked");
    celebration?.classList.remove("is-visible");
    refreshHearts();
  }, celebrationDuration);
};

const parseDateParts = (value) => {
  if (!value) return null;
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split("-").map(Number);
    return { year, month, day };
  }

  if (/^\d{2}[./-]\d{2}[./-]\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split(/[./-]/).map(Number);
    return { year, month, day };
  }

  if (/^\d{4}[./-]\d{2}[./-]\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split(/[./-]/).map(Number);
    return { year, month, day };
  }

  return null;
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

    if (!parts) {
      if (gateError) gateError.textContent = "Ivesk data (YYYY-MM-DD).";
      return;
    }

    if (matchesTargetDate(parts)) {
      if (gateError) gateError.textContent = "";
      unlockPage();
    } else if (gateError) {
      gateError.textContent = "Netinkama data. Pabandyk dar.";
    }
  });
}

window.addEventListener("resize", () => {
  refreshHearts();
});
