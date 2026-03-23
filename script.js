let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || ["Food", "Bills", "Shopping", "Personal"];
let caps = JSON.parse(localStorage.getItem("caps")) || { Food: 400, Bills: 1500, Shopping: 200, Personal: 100 };

function switchTab(tabId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
}

window.onload = () => { updateUI(); attachListeners(); };

function attachListeners() {
  document.getElementById("add-transaction-btn").onclick = addTransaction;
  document.getElementById("search-transactions").oninput = searchTransactions;
}

function addCategory() {
  const name = document.getElementById("new-cat-name").value.trim();
  if (name && !categories.includes(name)) {
    categories.push(name);
    caps[name] = 0;
    document.getElementById("new-cat-name").value = "";
    updateUI();
  }
}

function deleteCategory(cat) {
  if (confirm(`Delete ${cat}?`)) {
    categories = categories.filter(c => c !== cat);
    delete caps[cat];
    updateUI();
  }
}

function addTransaction() {
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type-select").value;
  const category = document.getElementById("category-select").value;
  const recurring = document.getElementById("is-recurring").checked;

  if (!desc || isNaN(amount)) return;
  transactions.push({ desc, amount, type, category, recurring, date: new Date().toLocaleDateString() });
  updateUI();
}

function updateUI() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("caps", JSON.stringify(caps));
  
  // Render Category Selects
  const sel = document.getElementById("category-select");
  sel.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');

  // Render Setup List
  document.getElementById("custom-cat-list").innerHTML = categories.map(c => `
    <div class="tag">${c} <span onclick="deleteCategory('${c}')">×</span></div>
  `).join('');

  // Render Caps Inputs
  document.getElementById("cap-inputs").innerHTML = categories.map(c => `
    <div class="cap-input-row"><span>${c}</span><input type="number" onchange="updateCap('${c}', this.value)" value="${caps[c] || 0}"></div>
  `).join('');

  renderDashboard();
  renderTransactions();
}

function updateCap(cat, val) { caps[cat] = parseFloat(val); }
function saveCaps() { updateUI(); alert("Saved!"); }

function renderDashboard() {
  const inc = transactions.reduce((a, t) => t.type === 'income' ? a + t.amount : a, 0);
  const exp = transactions.reduce((a, t) => t.type === 'expense' ? a + t.amount : a, 0);
  const inv = transactions.reduce((a, t) => t.type === 'invest' ? a + t.amount : a, 0);
  const bank = inc - exp - inv;
  
  document.getElementById("balance").innerText = `$${bank.toLocaleString()}`;
  document.getElementById("safe-spend").innerText = `$${Math.max(0, bank - (caps["Bills"] || 0)).toLocaleString()}`;
  document.getElementById("invested-val").innerText = `$${inv.toLocaleString()}`;

  const catTotals = {};
  transactions.filter(t => t.type === 'expense').forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });

  document.getElementById("category-bars").innerHTML = categories.map(c => {
    const spent = catTotals[c] || 0;
    const cap = caps[c] || 1;
    const pct = Math.min((spent / cap) * 100, 100);
    return `<div class="cat-row"><span>${c}</span><div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div><b>$${spent}</b></div>`;
  }).join('');
}

function renderTransactions() {
  document.getElementById("transaction-list").innerHTML = transactions.map((t, i) => `
    <li class="t-item">
      <div><b>${t.desc}</b><br><small>${t.category} ${t.recurring ? '🔄' : ''}</small></div>
      <b class="${t.type}">$${t.amount}</b>
      <button class="del-small" onclick="transactions.splice(${i},1);updateUI();">×</button>
    </li>
  `).reverse().join('');
}

function searchTransactions() {
  const term = document.getElementById("search-transactions").value.toLowerCase();
  document.querySelectorAll(".t-item").forEach(li => li.style.display = li.innerText.toLowerCase().includes(term) ? "flex" : "none");
}
