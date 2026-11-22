"use strict";

const root = document.documentElement;
const themeSwitch = document.getElementById("theme-switch");
const focusSwitch = document.getElementById("focus-switch");
const darkPreference = matchMedia("(prefers-color-scheme: dark)");
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");

function readPreference(name) {
  try { return localStorage.getItem("sumit-portfolio-" + name); } catch { return null; }
}

function savePreference(name, value) {
  try { localStorage.setItem("sumit-portfolio-" + name, value); } catch { /* Preferences still apply to this visit. */ }
}

function applyTheme(theme) {
  const dark = theme === "dark";
  root.dataset.theme = dark ? "dark" : "light";
  themeSwitch.textContent = dark ? "Light" : "Dark";
  themeSwitch.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  document.querySelector('meta[name="theme-color"]').content = dark ? "#19221e" : "#f3eee5";
}

let selectedTheme = readPreference("theme");
applyTheme(selectedTheme ?? (darkPreference.matches ? "dark" : "light"));
themeSwitch.addEventListener("click", () => {
  selectedTheme = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(selectedTheme);
  savePreference("theme", selectedTheme);
});
darkPreference.addEventListener?.("change", event => {
  if (!selectedTheme) applyTheme(event.matches ? "dark" : "light");
});

const pageAnimations = new Set();

function stopPageAnimations() {
  for (const animation of pageAnimations) animation.cancel();
  pageAnimations.clear();
}

function applyFocus(enabled) {
  root.dataset.focus = String(enabled);
  focusSwitch.setAttribute("aria-pressed", String(enabled));
  if (enabled) stopPageAnimations();
}

applyFocus(readPreference("focus") === "true");
focusSwitch.addEventListener("click", () => {
  const enabled = root.dataset.focus !== "true";
  applyFocus(enabled);
  savePreference("focus", String(enabled));
});
motionPreference.addEventListener?.("change", event => {
  if (event.matches) stopPageAnimations();
});

function showOnArrival(element, offset, duration, delay = 0) {
  if (motionPreference.matches || root.dataset.focus === "true" || typeof element.animate !== "function") return;
  const animation = element.animate(
    [{ opacity: .68, transform: "translateY(" + offset + "px)" }, { opacity: 1, transform: "translateY(0)" }],
    { duration, delay, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "backwards" }
  );
  pageAnimations.add(animation);
  animation.finished.then(() => pageAnimations.delete(animation), () => pageAnimations.delete(animation));
}

if (!location.hash || location.hash === "#home") {
  showOnArrival(document.querySelector(".hero-intro"), 14, 580);
  showOnArrival(document.querySelector(".trace"), 18, 620, 65);
}

if ("IntersectionObserver" in window) {
  const arrivals = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      arrivals.unobserve(entry.target);
      showOnArrival(entry.target, 12, 430);
    }
  }, { threshold: .16 });
  document.querySelectorAll(".section-heading, .project-card, .index-heading, .work-notes section")
    .forEach(element => arrivals.observe(element));
}

const navLinks = [...document.querySelectorAll(".site-header nav a[href^='#']")];
const chapters = navLinks.map(link => document.getElementById(link.hash.slice(1)));
const readingProgress = document.getElementById("reading-progress");
let readingFrame;

function updateReading() {
  readingFrame = undefined;
  const extent = root.scrollHeight - innerHeight;
  const fraction = extent > 0 ? Math.max(0, Math.min(1, scrollY / extent)) : 0;
  readingProgress.style.transform = "scaleX(" + fraction + ")";
  let active = -1;
  let closest = -Infinity;
  const boundary = document.querySelector(".site-header").offsetHeight + 36;
  chapters.forEach((chapter, index) => {
    const top = chapter.getBoundingClientRect().top;
    if (top > boundary) return;
    if (top > closest + 2 || (Math.abs(top - closest) <= 2 && navLinks[index].hash === location.hash)) {
      active = index;
      closest = top;
    }
  });
  if (fraction > .985) active = chapters.length - 1;
  navLinks.forEach((link, index) => {
    if (index === active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

function scheduleReading() {
  if (readingFrame === undefined) readingFrame = requestAnimationFrame(updateReading);
}

window.addEventListener("scroll", scheduleReading, { passive: true });
window.addEventListener("resize", scheduleReading);
scheduleReading();

const traces = {
  booklet: {
    question: "What kind of setting is suggested for practising relaxation?",
    stages: [
      ["Retrieve passages", "TF-IDF and MiniLM rank passages from the local documents. The app passes up to two to the model."],
      ["Answer in the recording", "A quiet place where you will not be interrupted."],
      ["Verified source quote", "“Choose a quiet place where you will not be interrupted”", "The Little Book of Mental Health"]
    ]
  },
  outside: {
    question: "What is the tallest mountain on Mars?",
    stages: [
      ["Retrieve passages", "The same retriever ranks passages from the two wellbeing documents."],
      ["Draft with evidence", "The model is asked to answer using the retrieved passages and cite a supporting quote."],
      ["Evidence fallback", "I couldn't find enough evidence in the documents to answer that."]
    ]
  }
};

const question = document.getElementById("trace-question");
const resultTitle = document.getElementById("trace-result-title");
const resultText = document.getElementById("trace-result-text");
const resultSource = document.getElementById("trace-result-source");
const scenarioButtons = [...document.querySelectorAll("[data-scenario]")];
const stageButtons = [...document.querySelectorAll("[data-stage]")];
let scenario = "booklet";
let stage = 2;

function renderTrace() {
  const current = traces[scenario];
  const [title, description, source] = current.stages[stage];
  question.textContent = current.question;
  resultTitle.textContent = title;
  resultText.textContent = description;
  resultSource.textContent = source ?? "";
  resultSource.hidden = !source;
  scenarioButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.scenario === scenario)));
  stageButtons.forEach(button => button.setAttribute("aria-pressed", String(Number(button.dataset.stage) === stage)));
}

scenarioButtons.forEach(button => button.addEventListener("click", () => {
  scenario = button.dataset.scenario;
  renderTrace();
}));

stageButtons.forEach(button => button.addEventListener("click", () => {
  stage = Number(button.dataset.stage);
  renderTrace();
}));

const viewport = document.getElementById("trace-viewport");
const defaultView = { yaw: -24, pitch: 18 };
let view = { ...defaultView };
let drag;

function setView(yaw, pitch) {
  view = { yaw: Math.max(-40, Math.min(40, yaw)), pitch: Math.max(0, Math.min(32, pitch)) };
  viewport.style.setProperty("--yaw", view.yaw + "deg");
  viewport.style.setProperty("--pitch", view.pitch + "deg");
}

document.querySelectorAll("[data-rotate]").forEach(button => {
  button.addEventListener("click", () => setView(view.yaw + Number(button.dataset.rotate) * 14, view.pitch));
});
document.getElementById("reset-view").addEventListener("click", () => setView(defaultView.yaw, defaultView.pitch));

viewport.addEventListener("pointerdown", event => {
  if (!event.isPrimary || event.button !== 0 || root.dataset.focus === "true") return;
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY, view, started: false };
});

viewport.addEventListener("pointermove", event => {
  if (!drag || event.pointerId !== drag.id) return;
  const dx = event.clientX - drag.x;
  const dy = event.clientY - drag.y;
  if (!drag.started) {
    if (Math.hypot(dx, dy) < 5) return;
    viewport.setPointerCapture(drag.id);
    viewport.classList.add("is-dragging");
    drag.started = true;
  }
  setView(drag.view.yaw + dx * .22, drag.view.pitch - dy * .18);
});

function finishDrag(event) {
  if (drag?.id !== event.pointerId) return;
  drag = undefined;
  viewport.classList.remove("is-dragging");
}

viewport.addEventListener("pointerup", finishDrag);
viewport.addEventListener("pointercancel", finishDrag);
viewport.addEventListener("lostpointercapture", finishDrag);
viewport.addEventListener("pointerleave", event => {
  if (!drag?.started) finishDrag(event);
});

const grid = document.getElementById("project-grid");
const projects = [...grid.querySelectorAll("[data-category]")];
const projectCount = document.getElementById("project-count");
const filters = [...document.querySelectorAll("button[data-filter]")];

filters.forEach(filter => filter.addEventListener("click", () => {
  const selected = filter.dataset.filter;
  grid.dataset.filter = selected;
  let visible = 0;
  projects.forEach(project => {
    project.hidden = selected !== "all" && project.dataset.category !== selected;
    if (!project.hidden) visible += 1;
  });
  filters.forEach(button => button.setAttribute("aria-pressed", String(button === filter)));
  projectCount.textContent = visible + (visible === 1 ? " project" : " projects");
  scheduleReading();
}));
document.getElementById("project-toolbar").hidden = false;

async function copyToClipboard(value, feedback, confirmation) {
  try {
    await navigator.clipboard.writeText(value);
    feedback.textContent = confirmation;
  } catch {
    feedback.textContent = value;
  }
}

const copyEmail = document.getElementById("copy-email");
copyEmail.hidden = false;
copyEmail.addEventListener("click", () => {
  const address = document.querySelector('[href^="mailto:"]').getAttribute("href").slice(7);
  copyToClipboard(address, document.getElementById("email-feedback"), "Email copied");
});

const dialog = document.getElementById("case-dialog");
const caseBody = document.getElementById("case-body");
const caseFeedback = document.getElementById("case-feedback");
const templates = new Map(
  [...document.querySelectorAll("template[data-project]")].map(template => [template.dataset.project, template])
);
let activeCase;
let opener;

function syncCase() {
  const key = location.hash.startsWith("#case-") ? location.hash.slice(6) : "";
  const template = templates.get(key);
  if (!template) {
    if (dialog.open) dialog.close();
    return;
  }
  if (dialog.open && activeCase === key) return;
  activeCase = key;
  caseBody.replaceChildren(template.content.cloneNode(true));
  caseBody.querySelector("h2").id = "case-title";
  caseFeedback.textContent = "";
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  document.body.classList.add("case-open");
}

function requestClose() {
  if (history.state?.portfolioCase === activeCase) {
    history.back();
    return;
  }
  history.replaceState(null, "", "#projects");
  syncCase();
  document.getElementById("projects").scrollIntoView();
}

function openCase(key, trigger) {
  opener = trigger;
  history.pushState({ portfolioCase: key }, "", "#case-" + key);
  syncCase();
}

if (typeof dialog.showModal === "function") {
  for (const link of document.querySelectorAll("a[data-case]")) {
    const key = link.dataset.case;
    link.setAttribute("href", "#case-" + key);
    link.addEventListener("click", event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      event.preventDefault();
      openCase(key, link);
    });
  }

  document.getElementById("close-case").addEventListener("click", requestClose);
  document.getElementById("copy-case").addEventListener("click", () => {
    const url = location.origin + location.pathname + location.hash;
    copyToClipboard(url, caseFeedback, "Case study link copied");
  });
  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    requestClose();
  });
  dialog.addEventListener("close", () => {
    if (dialog.open) return;
    document.body.classList.remove("case-open");
    const returnTo = opener?.isConnected && !opener.closest("[hidden]")
      ? opener
      : document.getElementById("projects-title");
    returnTo.focus({ preventScroll: true });
    opener = undefined;
    activeCase = undefined;
  });
  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right) requestClose();
  });

  window.addEventListener("popstate", syncCase);
  window.addEventListener("hashchange", syncCase);
  syncCase();
}

const searchDialog = document.getElementById("search-dialog");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
const searchEmpty = document.getElementById("search-empty");
const searchButton = document.getElementById("open-search");
const searchCanOpen = typeof searchDialog.showModal === "function";
const projectEntries = [...document.querySelectorAll(".index-row")].map(link => ({
  title: link.querySelector(".index-name").textContent,
  type: link.querySelector(".index-area").textContent,
  terms: link.querySelector(".index-evidence").textContent + (link.dataset.case === "analytics" ? " SaaS banking healthcare supply chain Power BI" : ""),
  href: link.getAttribute("href"),
  key: link.dataset.case
}));
const sectionEntries = [
  ["Selected projects", "#projects", "work case studies"],
  ["Project index", "#index", "all projects"],
  ["Experience", "#experience", "Ethara AI internships"],
  ["Tools I use", "#skills", "skills stack"],
  ["About me", "#about", "profile education"],
  ["Design work", "#creative", "posters graphics"],
  ["Contact", "#contact", "email LinkedIn"],
].map(([title, href, terms]) => ({ title, href, terms, type: "Section" }));
const entries = [...projectEntries, ...sectionEntries];
let matches = [];
let activeResult = -1;
let searchReturn;
let restoreSearchFocus = true;

function selectResult(index, scroll = false) {
  activeResult = index;
  const options = [...searchResults.children];
  options.forEach((option, i) => option.setAttribute("aria-selected", String(i === index)));
  const active = options[index];
  if (active) {
    searchInput.setAttribute("aria-activedescendant", active.id);
    if (scroll) active.scrollIntoView({ block: "nearest", behavior: "instant" });
  } else searchInput.removeAttribute("aria-activedescendant");
}

function renderSearch() {
  const words = searchInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  matches = entries.filter(item => {
    const searchText = [item.title, item.type, item.terms].join(" ").toLowerCase();
    return words.every(word => searchText.includes(word));
  });
  searchResults.replaceChildren(...matches.map((item, i) => {
    const option = document.createElement("li");
    option.id = "search-option-" + i;
    option.setAttribute("role", "option");
    option.dataset.index = String(i);
    const title = document.createElement("span");
    title.textContent = item.title;
    const type = document.createElement("span");
    type.className = "search-result-type";
    type.textContent = item.type;
    option.append(title, type);
    return option;
  }));
  searchEmpty.hidden = matches.length > 0;
  searchInput.setAttribute("aria-expanded", String(matches.length > 0));
  selectResult(matches.length > 0 ? 0 : -1);
}

function showSearch() {
  searchReturn = document.activeElement;
  restoreSearchFocus = true;
  searchInput.value = "";
  renderSearch();
  document.body.classList.add("search-open");
  searchDialog.showModal();
  searchInput.focus();
}

function openResult(item) {
  if (!item) return;
  restoreSearchFocus = false;
  searchDialog.close();
  if (item.key && typeof dialog.showModal === "function") {
    openCase(item.key, searchReturn instanceof HTMLElement ? searchReturn : searchButton);
  } else if (item.href.startsWith("#")) {
    const section = document.getElementById(item.href.slice(1));
    if (location.hash === item.href) section.scrollIntoView();
    else location.hash = item.href;
    const heading = section.querySelector("h2") ?? section;
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  } else location.assign(item.href);
}

if (searchCanOpen) {
  const system = navigator.userAgentData?.platform ?? navigator.platform;
  document.getElementById("search-shortcut").textContent = /mac/i.test(system) ? "⌘ K" : "Ctrl K";
  searchButton.addEventListener("click", showSearch);
  document.getElementById("close-search").addEventListener("click", () => searchDialog.close());
  searchInput.addEventListener("input", renderSearch);
  searchInput.addEventListener("keydown", event => {
    if (event.isComposing) return;
    if (event.key === "Escape") {
      event.preventDefault();
      searchDialog.close();
    } else if ((event.key === "ArrowDown" || event.key === "ArrowUp") && matches.length) {
      event.preventDefault();
      const offset = event.key === "ArrowDown" ? 1 : -1;
      selectResult((activeResult + offset + matches.length) % matches.length, true);
    } else if (event.key === "Enter") {
      event.preventDefault();
      openResult(matches[activeResult]);
    }
  });
  searchResults.addEventListener("pointermove", event => {
    const option = event.target.closest("[data-index]");
    if (option && Number(option.dataset.index) !== activeResult) selectResult(Number(option.dataset.index));
  });
  searchResults.addEventListener("click", event => {
    const option = event.target.closest("[data-index]");
    if (option) openResult(matches[Number(option.dataset.index)]);
  });
  searchDialog.addEventListener("close", () => {
    if (searchDialog.open) return;
    document.body.classList.remove("search-open");
    searchInput.setAttribute("aria-expanded", "false");
    if (restoreSearchFocus && searchReturn instanceof HTMLElement) searchReturn.focus({ preventScroll: true });
  });
} else searchButton.hidden = true;

document.addEventListener("keydown", event => {
  if (event.defaultPrevented || event.isComposing || event.repeat) return;
  const key = event.key.toLowerCase();
  if (key === "k" && (event.metaKey || event.ctrlKey) && searchCanOpen && !dialog.open) {
    event.preventDefault();
    if (searchDialog.open) searchDialog.close();
    else showSearch();
  } else if (key === "z" && !event.metaKey && !event.ctrlKey && !event.altKey && !dialog.open && !searchDialog.open &&
      !event.target?.closest?.("input, textarea, select, [contenteditable]")) {
    focusSwitch.click();
  }
});

document.getElementById("nav-tools").hidden = false;
