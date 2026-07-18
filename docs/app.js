"use strict";

// ---------------------------------------------------------------------------
// Academic Atlas — progressive-disclosure browser.
// Home view shows category tiles (no wall of cards); picking a category or
// searching opens a paginated browse view; clicking a card opens a detail
// panel. All state lives in the URL so any view is shareable.
// ---------------------------------------------------------------------------

const PAGE_SIZE = 9;

// Icon + accent per category (colors kept in sync with the --cat-* tokens in style.css).
const CATEGORY_META = {
  "International competitions":            { icon: "🏆", color: "#a4243b", blurb: "Olympiads, essay prizes, and global contests — with the Türkiye pathways that lead to them." },
  "Research programs / opportunities":    { icon: "🔬", color: "#1f7d89", blurb: "Mentored research and academic institutes." },
  "Summer schools":                       { icon: "☀️", color: "#c9741b", blurb: "Intensive residential summer programs." },
  "Scholarships":                         { icon: "🎓", color: "#2f8f5b", blurb: "Funding and full-ride awards." },
  "Academic courses":                     { icon: "📚", color: "#7a54a3", blurb: "Structured courses and online learning." },
  "Innovation challenges":                { icon: "💡", color: "#c14d86", blurb: "Entrepreneurship and design challenges." },
  "Academic journals & publications":     { icon: "📰", color: "#3f7cbf", blurb: "Publish your original research." },
  "Conferences & academic events":        { icon: "🎤", color: "#b8862a", blurb: "Conferences, summits, and MUNs." },
};
const CATEGORY_ORDER = Object.keys(CATEGORY_META);

const state = {
  records: [],
  q: "",
  category: "",
  format: "",
  status: "",
  scope: "",
  sort: "deadline",
  id: "",
  shown: PAGE_SIZE,
};

const el = {};
["home-view","browse-view","scope-bar","closing-soon","closing-soon-cards","category-grid",
 "intro-stats","browse-title","result-count","cards","empty-state","error-state","load-more",
 "search","format-filter","status-filter","sort","clear-filters",
 "detail-backdrop","detail-panel","detail-body","detail-close"].forEach((id) => {
  el[id] = document.getElementById(id);
});

// --- helpers ----------------------------------------------------------------

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}
function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
function safeUrl(value) {
  const url = String(value ?? "").trim();
  return /^https?:\/\//i.test(url) ? url : "";
}
function has(value) {
  return value && value !== "UNKNOWN";
}

const DAY = 86_400_000;

// Parse Application_Deadline into a structured shape used for pills + sorting.
function deadlineInfo(record) {
  const raw = String(record.Application_Deadline ?? "").trim();
  if (raw === "Rolling") return { kind: "rolling", sortKey: 2e12 };
  const time = Date.parse(raw);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw) || Number.isNaN(time)) {
    return { kind: "unknown", sortKey: 3e12 }; // unknowns sink below rolling
  }
  const days = Math.ceil((time - Date.now()) / DAY);
  return { kind: days < 0 ? "past" : "future", raw, days, sortKey: time };
}

function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Colored deadline pill (urgency-aware).
function deadlinePill(record) {
  const info = deadlineInfo(record);
  if (info.kind === "rolling") return pill("open", "🟢 Rolling — open now");
  if (info.kind === "unknown") return pill("neutral", "🗓 Next cycle — see notes");
  if (info.kind === "past") return pill("neutral", `Closed ${fmtDate(info.raw)}`);
  const d = info.days;
  const label = d === 0 ? "due today" : `${d} day${d === 1 ? "" : "s"} left`;
  const tone = d <= 30 ? "urgent" : d <= 90 ? "soon" : "ok";
  return pill(tone, `⏳ ${fmtDate(info.raw)} · ${label}`);
}

function pill(tone, text) {
  return `<span class="pill pill-${tone}">${escapeHtml(text)}</span>`;
}

function costPill(record) {
  if (!has(record.Cost)) return "";
  const isFree = /^free/i.test(record.Cost);
  return pill(isFree ? "free" : "cost", (isFree ? "✓ " : "💲 ") + record.Cost);
}
function formatPill(record) {
  if (!has(record.Format)) return "";
  const map = { Online: "online", "In-person": "inperson", Hybrid: "hybrid" };
  return pill(map[record.Format] || "neutral", record.Format);
}
function statusPill(record) {
  if (!has(record.Status)) return "";
  const map = { Active: "active", Upcoming: "upcoming", Archived: "archived" };
  return pill(map[record.Status] || "neutral", record.Status);
}

function freshness(record) {
  const time = Date.parse(record.Last_Verified);
  if (Number.isNaN(time)) return null;
  const days = Math.floor((Date.now() - time) / DAY);
  let text;
  if (days <= 0) text = "verified today";
  else if (days === 1) text = "verified 1 day ago";
  else if (days < 30) text = `verified ${days} days ago`;
  else if (days < 60) text = "verified 1 month ago";
  else if (days < 365) text = `verified ${Math.floor(days / 30)} months ago`;
  else text = "verified over a year ago";
  return { text, stale: days > 180 };
}

// --- filtering & sorting ----------------------------------------------------

// Eligibility scope: "intl" = open worldwide, "tr" = Türkiye only, "us" = US only.
function scopeMatches(r) {
  if (state.scope === "intl") return r.Eligibility_Scope === "International";
  if (state.scope === "tr") return r.Eligibility_Scope === "Türkiye only";
  if (state.scope === "us") return r.Eligibility_Scope === "US only";
  return true;
}

function scopePill(r) {
  if (r.Eligibility_Scope === "US only") return pill("us", "🇺🇸 US citizens/residents only");
  if (r.Eligibility_Scope === "Türkiye only") return pill("tr", "🇹🇷 Students in Türkiye");
  if (r.Eligibility_Scope === "International") return pill("intl", "🌍 Open worldwide");
  return "";
}

// --- national pathways (Qualifies_For) --------------------------------------
// A record with Qualifies_For set is a national/regional qualifying stage that
// feeds into another (usually international) opportunity.

// Prefer a trailing acronym in parentheses, e.g. "…Olympiad (IMO)" -> "IMO".
function acronym(name) {
  const m = String(name ?? "").match(/\(([^)]+)\)\s*$/);
  return m ? m[1] : String(name ?? "");
}
function pathwayChildren(record) {
  return state.records.filter((r) => r.Qualifies_For === record.ID);
}
function pathwayParent(record) {
  return has(record.Qualifies_For)
    ? state.records.find((r) => r.ID === record.Qualifies_For)
    : null;
}

// Small pill on a card telling which final a national stage leads to.
function pathwayPill(record) {
  const parent = pathwayParent(record);
  if (!parent) return "";
  return pill("pathway", "→ qualifies for " + acronym(parent.Name));
}

// A compact deadline label used inside pathway rows.
function deadlineShort(record) {
  const info = deadlineInfo(record);
  if (info.kind === "rolling") return "Rolling";
  if (info.kind === "future") return fmtDate(info.raw);
  if (info.kind === "past") return "Annual — next cycle";
  return "Announced annually";
}

// The pathway section shown inside a detail panel (parent link + child stages).
function pathwayHtml(record) {
  const parent = pathwayParent(record);
  const kids = pathwayChildren(record);
  let html = "";

  if (parent) {
    html += `<div class="pathway-parent">
      <span class="pathway-kicker">Qualifying stage — leads to</span>
      <button type="button" class="pathway-item" data-id="${escapeAttr(parent.ID)}">
        <span class="pathway-arrow" aria-hidden="true">↑</span>
        <span>
          <span class="pathway-name">${escapeHtml(parent.Name)}</span>
          <span class="pathway-sub">${escapeHtml(parent.Country_Region)} · the international final</span>
        </span>
        <span class="pathway-cue">View →</span>
      </button>
    </div>`;
  }

  if (kids.length) {
    const label = kids.length === 1 ? "How students in Türkiye qualify" : "National pathways to this competition";
    html += `<div class="pathway-block">
      <span class="pathway-kicker">🇹🇷 ${escapeHtml(label)}</span>
      <div class="pathway-list">` +
      kids.map((k) => `<button type="button" class="pathway-item" data-id="${escapeAttr(k.ID)}">
          <span>
            <span class="pathway-name">${escapeHtml(k.Name)}</span>
            <span class="pathway-sub">${escapeHtml(k.Country_Region)} · ${escapeHtml(deadlineShort(k))}</span>
          </span>
          <span class="pathway-cue">View →</span>
        </button>`).join("") +
      `</div></div>`;
  }
  return html;
}

function matchesFilters(r) {
  const q = state.q.trim().toLowerCase();
  const matchesSearch = !q ||
    [r.Name, r.Organizer, r.Description, r.Category, r.Country_Region, r.Eligibility]
      .filter(Boolean).some((f) => String(f).toLowerCase().includes(q));
  return matchesSearch && scopeMatches(r) &&
    (!state.category || r.Category === state.category) &&
    (!state.format || r.Format === state.format) &&
    (!state.status || r.Status === state.status);
}

const SORTERS = {
  deadline: (a, b) => deadlineInfo(a).sortKey - deadlineInfo(b).sortKey ||
                      String(a.Name).localeCompare(String(b.Name)),
  name: (a, b) => String(a.Name).localeCompare(String(b.Name)),
  category: (a, b) => String(a.Category).localeCompare(String(b.Category)) ||
                      String(a.Name).localeCompare(String(b.Name)),
  verified: (a, b) => (b._verifiedTime || 0) - (a._verifiedTime || 0),
};

function currentResults() {
  return state.records.filter(matchesFilters).sort(SORTERS[state.sort] || SORTERS.deadline);
}

// --- card + detail markup ---------------------------------------------------

function categoryBadge(category) {
  const meta = CATEGORY_META[category] || {};
  return `<span class="badge" data-category="${escapeAttr(category)}">${escapeHtml((meta.icon ? meta.icon + " " : "") + category)}</span>`;
}

function cardHtml(r) {
  const pathwayCls = has(r.Qualifies_For) ? " is-pathway" : "";
  return `
    <article class="card${pathwayCls}" role="button" tabindex="0" data-id="${escapeAttr(r.ID)}"
             aria-label="${escapeAttr(r.Name)} — view details">
      <div class="card-top">
        <h3>${escapeHtml(r.Name)}</h3>
        ${categoryBadge(r.Category)}
      </div>
      <p class="organizer">${escapeHtml(r.Organizer)} · ${escapeHtml(r.Country_Region)}</p>
      <p class="description">${escapeHtml(r.Description)}</p>
      <div class="pill-row">
        ${scopePill(r)}
        ${pathwayPill(r)}
        ${deadlinePill(r)}
        ${formatPill(r)}
        ${costPill(r)}
      </div>
      <span class="card-cue">View details →</span>
    </article>`;
}

function detailRow(label, value, cls) {
  if (!has(value)) return "";
  return `<div class="d-row ${cls || ""}">
      <span class="d-label">${escapeHtml(label)}</span>
      <span class="d-value">${escapeHtml(value)}</span>
    </div>`;
}

function detailHtml(r) {
  const url = safeUrl(r.Official_URL);
  const fresh = freshness(r);
  const link = url
    ? `<a class="detail-link" href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">Visit official source ↗</a>`
    : "";
  const notes = has(r.Notes)
    ? `<div class="detail-notes"><span class="d-label">Notes</span><p>${escapeHtml(r.Notes)}</p></div>` : "";
  return `
    <div class="detail-head">
      ${categoryBadge(r.Category)}
      <h2 id="detail-title">${escapeHtml(r.Name)}</h2>
      <p class="detail-org">${escapeHtml(r.Organizer)} · ${escapeHtml(r.Country_Region)}</p>
    </div>
    <div class="detail-pills">
      ${scopePill(r)} ${deadlinePill(r)} ${statusPill(r)} ${formatPill(r)} ${costPill(r)}
    </div>
    <p class="detail-desc">${escapeHtml(r.Description)}</p>
    <div class="detail-grid">
      ${detailRow("Eligibility", r.Eligibility, "d-eligibility")}
      ${detailRow("Who can apply",
          r.Eligibility_Scope === "US only" ? "U.S. citizens / permanent residents only"
        : r.Eligibility_Scope === "International" ? "Open to international students, including Türkiye"
        : "", "d-scope")}
      ${detailRow("Application deadline", has(r.Application_Deadline) ? r.Application_Deadline : "", "d-deadline")}
      ${detailRow("Event dates", r.Event_Dates, "d-dates")}
      ${detailRow("Cost", r.Cost, "d-cost")}
      ${detailRow("Format", r.Format, "d-format")}
      ${detailRow("Status", r.Status, "d-status")}
    </div>
    ${notes}
    ${pathwayHtml(r)}
    <div class="detail-footer">
      ${link}
      ${fresh ? `<span class="freshness${fresh.stale ? " stale" : ""}">${escapeHtml(fresh.text)} · ${escapeHtml(r.ID)}</span>` : ""}
    </div>`;
}

// --- rendering --------------------------------------------------------------

function render() {
  el["error-state"].hidden = true;
  el["scope-bar"].hidden = false;
  const browsing = Boolean(state.q || state.category || state.format || state.status);
  if (browsing) renderBrowse(); else renderHome();
  renderDetail();
}

function renderHome() {
  el["browse-view"].hidden = true;
  el["home-view"].hidden = false;

  // Live overview stats (whole database, independent of the active filter).
  if (el["intro-stats"]) {
    const total = state.records.length;
    const cats = CATEGORY_ORDER.filter((c) => state.records.some((r) => r.Category === c)).length;
    const pathways = state.records.filter((r) => has(r.Qualifies_For)).length;
    el["intro-stats"].innerHTML =
      `<li>🎓 <b>${total}</b> verified opportunities</li>` +
      `<li>🗂️ <b>${cats}</b> categories</li>` +
      `<li>🇹🇷 <b>${pathways}</b> Türkiye national pathways</li>`;
  }

  // Category tiles with live counts (respecting the active eligibility scope).
  const inScope = state.records.filter(scopeMatches);
  const counts = {};
  inScope.forEach((r) => { counts[r.Category] = (counts[r.Category] || 0) + 1; });
  el["category-grid"].innerHTML = CATEGORY_ORDER.map((cat) => {
    const meta = CATEGORY_META[cat];
    const n = counts[cat] || 0;
    return `<a class="cat-tile" href="?category=${encodeURIComponent(cat)}" style="--cat:${meta.color}">
        <span class="cat-icon" aria-hidden="true">${meta.icon}</span>
        <span class="cat-name">${escapeHtml(cat)}</span>
        <span class="cat-blurb">${escapeHtml(meta.blurb)}</span>
        <span class="cat-count">${n} ${n === 1 ? "opportunity" : "opportunities"}</span>
      </a>`;
  }).join("");

  // "Closing soon": nearest upcoming concrete deadlines (max 3), within scope.
  const soon = inScope
    .map((r) => ({ r, info: deadlineInfo(r) }))
    .filter((x) => x.info.kind === "future")
    .sort((a, b) => a.info.sortKey - b.info.sortKey)
    .slice(0, 3);
  if (soon.length) {
    el["closing-soon"].hidden = false;
    el["closing-soon-cards"].innerHTML = soon.map((x) => cardHtml(x.r)).join("");
  } else {
    el["closing-soon"].hidden = true;
  }
}

function renderBrowse() {
  el["home-view"].hidden = true;
  el["browse-view"].hidden = false;

  const results = currentResults();
  const title = state.category
    ? `${CATEGORY_META[state.category]?.icon || ""} ${state.category}`.trim()
    : state.q ? `Search: “${state.q}”` : "All opportunities";
  el["browse-title"].textContent = title;

  const slice = results.slice(0, state.shown);
  el["cards"].innerHTML = slice.map(cardHtml).join("");
  el["empty-state"].hidden = results.length !== 0;
  el["result-count"].textContent =
    `${results.length} ${results.length === 1 ? "opportunity" : "opportunities"}` +
    (results.length > slice.length ? ` · showing ${slice.length}` : "");

  el["load-more"].hidden = results.length <= slice.length;

  const filtersActive = Boolean(state.q || state.format || state.status);
  el["clear-filters"].hidden = !filtersActive;
}

function renderDetail() {
  const record = state.id ? state.records.find((r) => r.ID === state.id) : null;
  if (!record) { closeDetail(false); return; }
  el["detail-body"].innerHTML = detailHtml(record);
  el["detail-backdrop"].hidden = false;
  document.body.classList.add("no-scroll");
  el["detail-panel"].focus();
}

function closeDetail(updateUrl = true) {
  el["detail-backdrop"].hidden = true;
  document.body.classList.remove("no-scroll");
  if (updateUrl && state.id) {
    state.id = "";
    writeUrl();
  }
}

// --- URL <-> state ----------------------------------------------------------

function readUrl() {
  const p = new URLSearchParams(location.search);
  state.q = p.get("q") || "";
  state.category = p.get("category") || "";
  state.format = p.get("format") || "";
  state.status = p.get("status") || "";
  state.scope = ["intl", "tr", "us"].includes(p.get("scope")) ? p.get("scope") : "";
  state.sort = SORTERS[p.get("sort")] ? p.get("sort") : "deadline";
  state.id = p.get("id") || "";
  state.shown = PAGE_SIZE;
}

function writeUrl(push = false) {
  const p = new URLSearchParams();
  if (state.q) p.set("q", state.q);
  if (state.category) p.set("category", state.category);
  if (state.format) p.set("format", state.format);
  if (state.status) p.set("status", state.status);
  if (state.scope) p.set("scope", state.scope);
  if (state.sort && state.sort !== "deadline") p.set("sort", state.sort);
  if (state.id) p.set("id", state.id);
  const qs = p.toString();
  const url = qs ? `?${qs}` : location.pathname;
  if (push) history.pushState(null, "", url);
  else history.replaceState(null, "", url);
}

function syncControls() {
  el["search"].value = state.q;
  el["format-filter"].value = state.format;
  el["status-filter"].value = state.status;
  el["sort"].value = state.sort;
  document.querySelectorAll(".seg").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.scope === state.scope);
  });
}

function debounce(fn, delay) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), delay); };
}

function populate(selectEl, values) {
  [...values].filter(Boolean).sort().forEach((v) => {
    const o = document.createElement("option");
    o.value = v; o.textContent = v; selectEl.appendChild(o);
  });
}

// --- events -----------------------------------------------------------------

function openDetailById(id) {
  state.id = id;
  writeUrl(true);
  renderDetail();
}

function wireEvents() {
  el["search"].addEventListener("input", debounce((e) => {
    state.q = e.target.value; state.shown = PAGE_SIZE; writeUrl(); render();
  }, 150));

  el["format-filter"].addEventListener("change", (e) => {
    state.format = e.target.value; state.shown = PAGE_SIZE; writeUrl(); render();
  });
  el["status-filter"].addEventListener("change", (e) => {
    state.status = e.target.value; state.shown = PAGE_SIZE; writeUrl(); render();
  });
  el["sort"].addEventListener("change", (e) => {
    state.sort = e.target.value; writeUrl(); render();
  });
  el["clear-filters"].addEventListener("click", () => {
    state.q = state.format = state.status = ""; state.shown = PAGE_SIZE;
    syncControls(); writeUrl(); render();
  });
  el["load-more"].addEventListener("click", () => {
    state.shown += PAGE_SIZE; renderBrowse();
  });

  document.querySelectorAll(".seg").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.scope = btn.dataset.scope;
      state.shown = PAGE_SIZE;
      syncControls(); writeUrl(); render();
    });
  });

  // Card click / keyboard (event delegation across both card containers).
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link && link.matches(".cat-tile, .brand, .crumbs a")) {
      e.preventDefault();
      navigateTo(link.getAttribute("href"));
      return;
    }
    // Cards, and pathway rows inside the detail panel, both open a detail view.
    const opener = e.target.closest(".card[data-id], .pathway-item[data-id]");
    if (opener) openDetailById(opener.dataset.id);
  });
  el["cards"].addEventListener("keydown", cardKeydown);
  el["closing-soon-cards"].addEventListener("keydown", cardKeydown);

  // Detail dismissal.
  el["detail-close"].addEventListener("click", () => closeDetail());
  el["detail-backdrop"].addEventListener("click", (e) => {
    if (e.target === el["detail-backdrop"]) closeDetail();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !el["detail-backdrop"].hidden) closeDetail();
  });

  window.addEventListener("popstate", () => { readUrl(); syncControls(); render(); });
}

function cardKeydown(e) {
  const card = e.target.closest(".card[data-id]");
  if (card && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    openDetailById(card.dataset.id);
  }
}

function navigateTo(href) {
  const url = new URL(href, location.href);
  history.pushState(null, "", url.pathname + url.search);
  readUrl(); syncControls(); render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// --- init -------------------------------------------------------------------

async function init() {
  let records;
  try {
    const res = await fetch("data.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    records = await res.json();
  } catch (err) {
    console.error("Failed to load data.json:", err);
    el["home-view"].hidden = true;
    el["browse-view"].hidden = true;
    el["error-state"].hidden = false;
    return;
  }

  records.forEach((r) => { r._verifiedTime = Date.parse(r.Last_Verified) || 0; });
  state.records = records;

  populate(el["format-filter"], new Set(records.map((r) => r.Format)));
  populate(el["status-filter"], new Set(records.map((r) => r.Status)));

  readUrl();
  syncControls();
  wireEvents();
  render();
}

init();
