"use strict";

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
  if (!event.isPrimary || event.button !== 0) return;
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

if (typeof dialog.showModal === "function") {
  for (const link of document.querySelectorAll("a[data-case]")) {
    const key = link.dataset.case;
    link.setAttribute("href", "#case-" + key);
    link.addEventListener("click", event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      event.preventDefault();
      opener = link;
      history.pushState({ portfolioCase: key }, "", link.hash);
      syncCase();
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
