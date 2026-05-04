const header = document.querySelector(".site-header");
const atlas = document.querySelector("[data-atlas]");
const atlasStage = document.querySelector("[data-atlas-stage]");
const atlasStageCopy = document.querySelector("[data-atlas-stage-copy]");
const atlasSteps = Array.from(document.querySelectorAll("[data-atlas-copy-step]"));
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const atlasLabels = [
  ["Zurich", "Swiss market credibility"],
  ["DACH", "OTA revenue leadership"],
  ["Europe", "Leisure-tech market expansion"],
  ["Launchpad", "Startup ecosystem builder"],
];

let rafId = null;

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (start, end, progress) => start + (end - start) * progress;

const setAtlasStage = (progress) => {
  const index = Math.min(atlasLabels.length - 1, Math.floor(progress * atlasLabels.length));
  const [label, copy] = atlasLabels[index];

  if (atlasStage) atlasStage.textContent = label;
  if (atlasStageCopy) atlasStageCopy.textContent = copy;

  atlasSteps.forEach((step, stepIndex) => {
    step.classList.toggle("is-active", stepIndex === index);
  });
};

const getAtlasProgress = () => {
  if (!atlas) return 0;
  const rect = atlas.getBoundingClientRect();
  const viewport = window.innerHeight || document.documentElement.clientHeight;
  const denominator = Math.max(1, rect.height - viewport * 0.82);
  return clamp((viewport * 0.92 - rect.top) / denominator);
};

const updateAtlas = () => {
  if (!atlas) return;

  if (motionQuery.matches || window.innerWidth <= 680) {
    atlas.style.setProperty("--atlas-progress", "1");
    atlas.style.setProperty("--atlas-scale", "0.82");
    atlas.style.setProperty("--atlas-x", "-6%");
    atlas.style.setProperty("--atlas-y", "-4%");
    setAtlasStage(1);
    return;
  }

  const progress = getAtlasProgress();
  atlas.style.setProperty("--atlas-progress", progress.toFixed(3));
  atlas.style.setProperty("--atlas-scale", lerp(1.48, 0.82, progress).toFixed(3));
  atlas.style.setProperty("--atlas-x", `${lerp(10, -6, progress).toFixed(2)}%`);
  atlas.style.setProperty("--atlas-y", `${lerp(8, -4, progress).toFixed(2)}%`);
  setAtlasStage(progress);
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
