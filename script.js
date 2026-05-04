const header = document.querySelector(".site-header");
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

let rafId = null;
let activeAtlasIndex = -1;

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

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
  return clamp((viewport * 0.58 - rect.top) / Math.max(1, rect.height - viewport));
};

const getActiveAtlasIndex = () => {
  if (!atlasSteps.length) return 0;
  const viewport = window.innerHeight || document.documentElement.clientHeight;
  const target = viewport * 0.52;
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
  const progress = motionQuery.matches ? chapterProgress : Math.max(rawProgress, chapterProgress * 0.82);
  atlas.style.setProperty("--atlas-progress", progress.toFixed(3));
  setAtlasChapter(index);
};

const updatePage = () => {
  rafId = null;
  if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
  updateAtlas();
};

const requestUpdate = () => {
  if (rafId !== null) return;
  rafId = window.requestAnimationFrame(updatePage);
};

updatePage();
window.addEventListener("scroll", requestUpdate, { passive: true });
window.addEventListener("resize", requestUpdate);
if (typeof motionQuery.addEventListener === "function") {
  motionQuery.addEventListener("change", requestUpdate);
} else if (typeof motionQuery.addListener === "function") {
  motionQuery.addListener(requestUpdate);
}
