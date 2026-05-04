const header = document.querySelector(".site-header");
const heroCard = document.querySelector(".hero-card");
const build = document.querySelector("[data-build]");
const buildChapters = Array.from(document.querySelectorAll("[data-build-step]"));
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (start, end, t) => start + (end - start) * t;
const ease = (t) => 1 - Math.pow(1 - clamp(t), 3);
const subProgress = (progress, start, end) => ease(clamp((progress - start) / (end - start)));

const partRanges = {
  shell: [0.02, 0.18],
  header: [0.08, 0.22],
  passenger: [0.18, 0.34],
  route: [0.32, 0.5],
  details: [0.5, 0.66],
  stub: [0.62, 0.78],
  barcode: [0.74, 0.9],
  stamp: [0.9, 1.0],
};

const legRanges = [
  [0.34, 0.4],
  [0.4, 0.46],
  [0.46, 0.52],
  [0.52, 0.58],
];

const arrowRanges = [
  [0.37, 0.43],
  [0.43, 0.49],
  [0.49, 0.55],
];

let rafId = null;
let activeChapterIndex = -1;

const setActiveChapter = (index) => {
  if (index === activeChapterIndex) return;
  activeChapterIndex = index;
  if (build) build.dataset.buildIndex = String(index);
  buildChapters.forEach((chapter, idx) => chapter.classList.toggle("is-active", idx === index));
};

const getBuildProgress = () => {
  if (!build) return 0;
  const rect = build.getBoundingClientRect();
  const viewport = window.innerHeight || document.documentElement.clientHeight;
  const total = Math.max(1, rect.height - viewport * 0.7);
  return clamp((viewport * 0.5 - rect.top) / total);
};

const getActiveChapterIndex = () => {
  if (!buildChapters.length) return 0;
  const viewport = window.innerHeight || document.documentElement.clientHeight;
  const target = viewport * 0.5;
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  buildChapters.forEach((chapter, idx) => {
    const rect = chapter.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const distance = Math.abs(center - target);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = idx;
    }
  });

  return bestIndex;
};

const updateBuild = () => {
  if (!build) return;

  const reduced = motionQuery.matches;
  const chapterIndex = getActiveChapterIndex();
  const rawProgress = getBuildProgress();
  const chapterProgress = buildChapters.length <= 1 ? 1 : chapterIndex / (buildChapters.length - 1);
  const progress = reduced ? 1 : Math.max(rawProgress, chapterProgress * 0.95);

  build.style.setProperty("--build-progress", progress.toFixed(3));

  Object.entries(partRanges).forEach(([key, [start, end]]) => {
    const partProgress = reduced ? 1 : subProgress(progress, start, end);
    build.style.setProperty(`--${key}-p`, partProgress.toFixed(3));
  });

  legRanges.forEach(([start, end], idx) => {
    const legProgress = reduced ? 1 : subProgress(progress, start, end);
    build.style.setProperty(`--leg${idx}-p`, legProgress.toFixed(3));
  });

  arrowRanges.forEach(([start, end], idx) => {
    const arrowProgress = reduced ? 1 : subProgress(progress, start, end);
    build.style.setProperty(`--arrow${idx}-p`, arrowProgress.toFixed(3));
  });

  setActiveChapter(chapterIndex);
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
  updateBuild();
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
