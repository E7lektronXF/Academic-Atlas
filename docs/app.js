const state = {
  records: [],
  search: "",
  category: "",
  format: "",
  status: "",
};

const el = {
  cards: document.getElementById("cards"),
  emptyState: document.getElementById("empty-state"),
  resultCount: document.getElementById("result-count"),
  search: document.getElementById("search"),
  categoryFilter: document.getElementById("category-filter"),
  formatFilter: document.getElementById("format-filter"),
  statusFilter: document.getElementById("status-filter"),
};

function populateFilter(selectEl, values) {
  [...values].sort().forEach((value) => {
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
    [record.Name, record.Organizer, record.Description, record.Category]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(q));

  const matchesCategory = !state.category || record.Category === state.category;
  const matchesFormat = !state.format || record.Format === state.format;
  const matchesStatus = !state.status || record.Status === state.status;

  return matchesSearch && matchesCategory && matchesFormat && matchesStatus;
}

function render() {
  const filtered = state.records.filter(matchesFilters);

  el.cards.innerHTML = "";
  filtered.forEach((record) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="card-top">
        <h2>${escapeHtml(record.Name)}</h2>
        <span class="badge">${escapeHtml(record.Category)}</span>
      </div>
      <p class="organizer">${escapeHtml(record.Organizer)} · ${escapeHtml(record.Country_Region)}</p>
      <p class="description">${escapeHtml(record.Description)}</p>
      <div class="meta-row">
        <span>Format: ${escapeHtml(record.Format)}</span>
        <span>Cost: ${escapeHtml(record.Cost)}</span>
        <span>Status: ${escapeHtml(record.Status)}</span>
      </div>
      <a class="official-link" href="${escapeAttr(record.Official_URL)}" target="_blank" rel="noopener">
        Official source ↗
      </a>
    `;
    el.cards.appendChild(card);
  });

  el.emptyState.hidden = filtered.length !== 0;
  el.resultCount.textContent = `${filtered.length} of ${state.records.length} opportunities`;
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

function escapeAttr(value) {
  return (value ?? "").replace(/"/g, "%22");
}

async function init() {
  const response = await fetch("data.json");
  state.records = await response.json();

  populateFilter(el.categoryFilter, new Set(state.records.map((r) => r.Category)));
  populateFilter(el.formatFilter, new Set(state.records.map((r) => r.Format)));
  populateFilter(el.statusFilter, new Set(state.records.map((r) => r.Status)));

  el.search.addEventListener("input", (e) => {
    state.search = e.target.value;
    render();
  });
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

  render();
}

init();
