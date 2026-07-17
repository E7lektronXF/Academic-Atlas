const state = {
  records: [],
  search: "",
  category: "",
  format: "",
  status: "",
  sort: "name",
};

const el = {
  cards: document.getElementById("cards"),
  emptyState: document.getElementById("empty-state"),
  errorState: document.getElementById("error-state"),
  resultCount: document.getElementById("result-count"),
  search: document.getElementById("search"),
  categoryFilter: document.getElementById("category-filter"),
  formatFilter: document.getElementById("format-filter"),
  statusFilter: document.getElementById("status-filter"),
  sort: document.getElementById("sort"),
  clearBtn: document.getElementById("clear-filters"),
};

// Which state keys map to which URL query params, so filtered views are shareable.
const URL_KEYS = {
  q: "search",
  category: "category",
  format: "format",
  status: "status",
  sort: "sort",
};

function populateFilter(selectEl, values) {
  [...values]
    .filter(Boolean)
    .sort()
    .forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      selectEl.appendChild(option);
    });
}

function matchesFilters(record) {
  const q = state.search.trim().toLowerCase();
  const matchesSearch =
    !q ||
    [record.Name, record.Organizer, record.Description, record.Category, record.Country_Region]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(q));

  const matchesCategory = !state.category || record.Category === state.category;
  const matchesFormat = !state.format || record.Format === state.format;
  const matchesStatus = !state.status || record.Status === state.status;

  return matchesSearch && matchesCategory && matchesFormat && matchesStatus;
}

const SORTERS = {
  name: (a, b) => String(a.Name).localeCompare(String(b.Name)),
  category: (a, b) =>
    String(a.Category).localeCompare(String(b.Category)) ||
    String(a.Name).localeCompare(String(b.Name)),
  // Most recently verified first; unknown/invalid dates sink to the bottom.
  verified: (a, b) => (b._verifiedTime || 0) - (a._verifiedTime || 0),
};

// Human-friendly "verified N days ago", plus a stale flag for old entries.
function freshness(lastVerified) {
  const time = Date.parse(lastVerified);
  if (Number.isNaN(time)) return null;
  const days = Math.floor((Date.now() - time) / 86_400_000);
  let text;
  if (days <= 0) text = "verified today";
  else if (days === 1) text = "verified 1 day ago";
  else if (days < 30) text = `verified ${days} days ago`;
  else if (days < 60) text = "verified 1 month ago";
  else if (days < 365) text = `verified ${Math.floor(days / 30)} months ago`;
  else text = `verified over a year ago`;
  return { text, stale: days > 180 };
}

// Only render links we trust; block javascript:/data: and other schemes.
function safeUrl(value) {
  const url = String(value ?? "").trim();
  return /^https?:\/\//i.test(url) ? url : "";
}

function metaChip(label, value) {
  if (!value || value === "UNKNOWN") return "";
  return `<span><span class="meta-key">${escapeHtml(label)}:</span> ${escapeHtml(value)}</span>`;
}

function render() {
  const filtered = state.records.filter(matchesFilters);
  filtered.sort(SORTERS[state.sort] || SORTERS.name);

  el.cards.innerHTML = "";
  const fragment = document.createDocumentFragment();

  filtered.forEach((record) => {
    const card = document.createElement("article");
    card.className = "card";

    const fresh = freshness(record.Last_Verified);
    const url = safeUrl(record.Official_URL);
    const link = url
      ? `<a class="official-link" href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">Official source ↗</a>`
      : "";
    const notes = record.Notes && record.Notes !== "UNKNOWN"
      ? `<details class="notes"><summary>Notes</summary><p>${escapeHtml(record.Notes)}</p></details>`
      : "";

    card.innerHTML = `
      <div class="card-top">
        <h2>${escapeHtml(record.Name)}</h2>
        <span class="badge" data-category="${escapeAttr(record.Category)}">${escapeHtml(record.Category)}</span>
      </div>
      <p class="organizer">${escapeHtml(record.Organizer)} · ${escapeHtml(record.Country_Region)}</p>
      <p class="eligibility"><span class="meta-key">Eligibility:</span> ${escapeHtml(record.Eligibility)}</p>
      <p class="description">${escapeHtml(record.Description)}</p>
      <div class="meta-row">
        ${metaChip("Format", record.Format)}
        ${metaChip("Cost", record.Cost)}
        ${metaChip("Status", record.Status)}
        ${metaChip("Deadline", record.Application_Deadline)}
        ${metaChip("Dates", record.Event_Dates)}
      </div>
      ${notes}
      <div class="card-footer">
        ${link}
        ${fresh ? `<span class="freshness${fresh.stale ? " stale" : ""}">${escapeHtml(fresh.text)}</span>` : ""}
      </div>
    `;
    fragment.appendChild(card);
  });

  el.cards.appendChild(fragment);
  el.emptyState.hidden = filtered.length !== 0;
  el.resultCount.textContent = `${filtered.length} of ${state.records.length} opportunities`;

  const filtersActive = Boolean(
    state.search || state.category || state.format || state.status
  );
  el.clearBtn.hidden = !filtersActive;

  writeUrl();
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

// --- URL <-> state sync -----------------------------------------------------

function readUrl() {
  const params = new URLSearchParams(location.search);
  for (const [param, key] of Object.entries(URL_KEYS)) {
    if (params.has(param)) state[key] = params.get(param);
  }
  if (!SORTERS[state.sort]) state.sort = "name";
}

function writeUrl() {
  const params = new URLSearchParams();
  for (const [param, key] of Object.entries(URL_KEYS)) {
    const value = state[key];
    if (value && !(param === "sort" && value === "name")) params.set(param, value);
  }
  const query = params.toString();
  history.replaceState(null, "", query ? `?${query}` : location.pathname);
}

function syncControlsFromState() {
  el.search.value = state.search;
  el.categoryFilter.value = state.category;
  el.formatFilter.value = state.format;
  el.statusFilter.value = state.status;
  el.sort.value = state.sort;
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// --- init -------------------------------------------------------------------

async function init() {
  let records;
  try {
    const response = await fetch("data.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    records = await response.json();
  } catch (err) {
    console.error("Failed to load data.json:", err);
    el.errorState.hidden = false;
    el.resultCount.textContent = "";
    return;
  }

  // Precompute verification timestamps once for the "recently verified" sort.
  records.forEach((r) => {
    r._verifiedTime = Date.parse(r.Last_Verified) || 0;
  });
  state.records = records;

  populateFilter(el.categoryFilter, new Set(records.map((r) => r.Category)));
  populateFilter(el.formatFilter, new Set(records.map((r) => r.Format)));
  populateFilter(el.statusFilter, new Set(records.map((r) => r.Status)));

  readUrl();
  syncControlsFromState();

  el.search.addEventListener(
    "input",
    debounce((e) => {
      state.search = e.target.value;
      render();
    }, 150)
  );
  el.categoryFilter.addEventListener("change", (e) => {
    state.category = e.target.value;
    render();
  });
  el.formatFilter.addEventListener("change", (e) => {
    state.format = e.target.value;
    render();
  });
  el.statusFilter.addEventListener("change", (e) => {
    state.status = e.target.value;
    render();
  });
  el.sort.addEventListener("change", (e) => {
    state.sort = e.target.value;
    render();
  });
  el.clearBtn.addEventListener("click", () => {
    state.search = state.category = state.format = state.status = "";
    syncControlsFromState();
    render();
  });

  render();
}

init();
