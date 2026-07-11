function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function safeText(value) {
  return value == null ? "" : escapeHtml(String(value));
}

function populateFields() {
  document.querySelectorAll("[data-field]").forEach((element) => {
    const key = element.dataset.field;
    if (key && siteConfig[key]) {
      element.textContent = siteConfig[key];
    }
  });

  document.querySelectorAll("[data-email-link]").forEach((emailLink) => {
    if (siteConfig.email) {
      emailLink.href = `mailto:${siteConfig.email}`;
      emailLink.textContent = siteConfig.email;
    }
  });
}

function renderTimeline(items, containerId, renderItem) {
  const container = document.querySelector(containerId);
  if (!container) return;
  container.innerHTML = items.map(renderItem).join("");
}

function formatDetails(text) {
  if (!text || !text.trim()) return "";
  const trimmed = text.trim();
  const lines = trimmed.split("\n").flatMap((line) => line.split("·").map((part) => part.trim())).filter(Boolean);
  if (lines.length > 1) {
    return `<ul class="details-list">${lines.map((d) => `<li>${safeText(d)}</li>`).join("")}</ul>`;
  }
  return `<p>${safeText(lines[0] || trimmed)}</p>`;
}

function renderEducation() {
  renderTimeline(siteConfig.education, "#education-list", (item) => {
    const supervisor = item.supervisor
      ? `<p class="education-supervisor">${safeText(siteStrings.education.supervisor)}<strong>${safeText(item.supervisor)}</strong></p>`
      : "";
    return `
      <article class="timeline-item">
        <h3>${safeText(item.degree)}</h3>
        <p><strong>${safeText(item.school)}</strong> · ${safeText(item.period)}</p>
        ${supervisor}
        <details class="education-collapsible">
          <summary class="collapsible-summary">${safeText(siteStrings.education.abstractSummary)}</summary>
          <div class="collapsible-content">
            ${formatDetails(item.details)}
          </div>
        </details>
      </article>
    `;
  });
}

function renderExperience() {
  const other = (siteConfig.experience || []).filter((e) => e.category === "other");

  renderTimeline(other, "#other-experience-list", (item) => {
    return `
      <article class="timeline-item">
        <h3>${safeText(item.role)}</h3>
        <p><strong>${safeText(item.organization)}</strong> · ${safeText(item.period)}</p>
        <p>${safeText(item.description)}</p>
      </article>
    `;
  });

  if (other.length === 0) {
    const section = document.querySelector("#other-experience");
    if (section) section.remove();
  }
}

function renderPublications() {
  const container = document.querySelector("#publications-list");
  if (!container) return;

  const items = siteConfig.publications || [];
  if (items.length === 0) {
    const section = container.closest("section");
    if (section) section.remove();
    return;
  }

  const groups = {};
  items.forEach((item) => {
    const key = item.type || "Other";
    (groups[key] = groups[key] || []).push(item);
  });

  const groupHtml = Object.entries(groups)
    .map(([type, list]) => {
      const entries = list
        .map((item) => {
          const meta = [item.venue, item.year].filter(Boolean).join(", ");
          const link = item.link
            ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">link</a>`
            : "";
          return `
            <li class="publication-item">
              <span class="publication-title">${safeText(item.title)}</span>${item.authors ? ` <span class="publication-authors">${safeText(item.authors)}</span>` : ""}${meta ? ` <span class="publication-meta">${safeText(meta)}</span>` : ""}${link ? ` <span class="publication-link">${link}</span>` : ""}
            </li>
          `;
        })
        .join("");
      return `
        <div class="publications-group">
          <h3 class="section-accent">${safeText(type)}</h3>
          <ul class="publications-list">${entries}</ul>
        </div>
      `;
    })
    .join("");

  container.innerHTML = groupHtml;
}

function renderConferences() {
  const groups = {
    public: document.querySelector("#conferences-public"),
    scientific: document.querySelector("#conferences-scientific"),
    attendance: document.querySelector("#conferences-attendance"),
  };

  Object.values(groups).forEach((container) => {
    if (container) container.innerHTML = "";
  });

  siteConfig.conferences.forEach((item) => {
    const container = groups[item.type];
    if (!container) return;

    const element = document.createElement("article");
    element.className = "timeline-item";
    element.innerHTML = `
      <h3>${safeText(item.title)}</h3>
      <p><strong>${safeText(item.event)}</strong> · ${safeText(item.date)}</p>
      ${formatDetails(item.description)}
    `;
    container.appendChild(element);
  });
}

function renderAbout() {
  const container = document.querySelector("#about-content");
  if (!container) return;
  const text = siteConfig.about || siteConfig.summary;
  if (!text) return;
  const html = text
    .replace(/\n/g, "<br>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer"><strong>$1</strong></a>'
    );
  container.innerHTML = html;
}

function initThemeToggle() {
  const root = document.documentElement;
  const toggle = document.querySelector("#theme-toggle");
  if (!toggle) return;

  function syncLabel(theme) {
    toggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
  }

  syncLabel(root.getAttribute("data-theme"));

  toggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
    syncLabel(next);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  populateFields();
  renderAbout();
  renderEducation();
  renderExperience();
  renderPublications();
  renderConferences();
});
