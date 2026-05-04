const header = document.querySelector(".site-header");
const heroCard = document.querySelector(".hero-card");
const atlas = document.querySelector("[data-atlas]");
const atlasTitle = document.querySelector("[data-atlas-title]");
const atlasSummary = document.querySelector("[data-atlas-summary]");
const atlasMetric = document.querySelector("[data-atlas-metric]");
const atlasProof = document.querySelector("[data-atlas-proof]");
const atlasSteps = Array.from(document.querySelectorAll("[data-atlas-step]"));
const atlasDots = Array.from(document.querySelectorAll("[data-atlas-dot]"));
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const atlasChapters = [
  {
    title: "Swiss market credibility",
    summary: "Built local trust as Managing Director Switzerland and legal representative for Amadeus.",
    metric: "15+ years",
    proof: "Executive continuity inside Amadeus",
  },
  {
    title: "DACH OTA revenue leadership",
    summary: "Led commercial relationships across leisure and air-focused online travel agency portfolios.",
    metric: "13M€",
    proof: "Annual OTA revenue responsibility",
  },
  {
    title: "European expansion",
    summary: "Expanded leisure technology across France, Benelux, Scandinavia, and CESE.",
    metric: "6M€",
    proof: "International P&L ownership",
  },
  {
    title: "Startup ecosystem builder",
    summary: "Leads Amadeus Launchpad Europe from scouting through onboarding and graduation.",
    metric: "1.5M€",
    proof: "ACV responsibility",
  },
];

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (start, end, t) => start + (end - start) * t;

let rafId = null;
let activeAtlasIndex = -1;

const setAtlasChapter = (index) => {
  const safeIndex = Math.round(clamp(index, 0, atlasChapters.length - 1));
  if (safeIndex === activeAtlasIndex) return;

  activeAtlasIndex = safeIndex;
  const chapter = atlasChapters[safeIndex];
  if (atlas) atlas.dataset.atlasIndex = String(safeIndex);
  if (atlasTitle) atlasTitle.textContent = chapter.title;
  if (atlasSummary) atlasSummary.textContent = chapter.summary;
  if (atlasMetric) atlasMetric.textContent = chapter.metric;
  if (atlasProof) atlasProof.textContent = chapter.proof;

  atlasSteps.forEach((step, stepIndex) => step.classList.toggle("is-active", stepIndex === safeIndex));
  atlasDots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === safeIndex));
};

const getAtlasProgress = () => {
  if (!atlas) return 0;
  const rect = atlas.getBoundingClientRect();
  const viewport = window.innerHeight || document.documentElement.clientHeight;
  return clamp((viewport * 0.62 - rect.top) / Math.max(1, rect.height - viewport * 0.6));
};

const getActiveAtlasIndex = () => {
  if (!atlasSteps.length) return 0;
  const viewport = window.innerHeight || document.documentElement.clientHeight;
  const target = viewport * 0.5;
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  atlasSteps.forEach((step, index) => {
    const rect = step.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const distance = Math.abs(center - target);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
};

const updateAtlas = () => {
  if (!atlas) return;
  const index = getActiveAtlasIndex();
  const rawProgress = getAtlasProgress();
  const chapterProgress = atlasChapters.length <= 1 ? 1 : index / (atlasChapters.length - 1);
  const progress = motionQuery.matches ? chapterProgress : Math.max(rawProgress, chapterProgress * 0.85);
  atlas.style.setProperty("--atlas-progress", progress.toFixed(3));
  setAtlasChapter(index);
};

const updateHero = () => {
  if (!heroCard || motionQuery.matches) return;
  const rect = heroCard.getBoundingClientRect();
  const viewport = window.innerHeight || document.documentElement.clientHeight;
  const offset = clamp((viewport - rect.top) / (viewport + rect.height));
  const translate = lerp(-12, 12, offset);
  heroCard.style.setProperty("transform", `translate3d(0, ${translate.toFixed(2)}px, 0)`);
};

const updatePage = () => {
  rafId = null;
  if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
  updateHero();
  updateAtlas();
};

const requestUpdate = () => {
  if (rafId !== null) return;
  rafId = window.requestAnimationFrame(updatePage);
};

// --- Scroll reveal -----------------------------------------------------
const revealTargets = Array.from(document.querySelectorAll("[data-reveal]"));
revealTargets.forEach((target) => {
  const parent = target.closest("[data-reveal-group]");
  if (!parent) return;
  const siblings = Array.from(parent.querySelectorAll(":scope > * [data-reveal], :scope > [data-reveal]"));
  const idx = siblings.indexOf(target);
  if (idx >= 0) target.style.setProperty("--reveal-index", String(idx));
});

if (motionQuery.matches) {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
} else if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );
  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

// --- Animated counters -------------------------------------------------
const counters = Array.from(document.querySelectorAll("[data-counter]"));
const formatCounter = (value, decimals) => {
  if (decimals > 0) return value.toFixed(decimals);
  return Math.round(value).toString();
};

const animateCounter = (el) => {
  const target = parseFloat(el.dataset.counterTarget || "0");
  const decimals = parseInt(el.dataset.counterDecimals || "0", 10);
  const suffix = el.dataset.counterSuffix || "";
  const duration = 1400;

  if (motionQuery.matches || Number.isNaN(target)) {
    el.textContent = el.dataset.counterFallback || `${formatCounter(target, decimals)}${suffix}`;
    return;
  }

  const start = performance.now();
  const tick = (now) => {
    const t = clamp((now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = `${formatCounter(target * eased, decimals)}${suffix}`;
    if (t < 1) window.requestAnimationFrame(tick);
    else el.textContent = el.dataset.counterFallback || `${formatCounter(target, decimals)}${suffix}`;
  };
  window.requestAnimationFrame(tick);
};

if (counters.length) {
  if (motionQuery.matches || !("IntersectionObserver" in window)) {
    counters.forEach(animateCounter);
  } else {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((counter) => counterObserver.observe(counter));
  }
}

updatePage();
window.addEventListener("scroll", requestUpdate, { passive: true });
window.addEventListener("resize", requestUpdate);
if (typeof motionQuery.addEventListener === "function") {
  motionQuery.addEventListener("change", requestUpdate);
} else if (typeof motionQuery.addListener === "function") {
  motionQuery.addListener(requestUpdate);
}
