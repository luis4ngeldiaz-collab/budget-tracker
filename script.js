let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || ["Food", "Bills", "Gas", "Personal"];
let caps = JSON.parse(localStorage.getItem("caps")) || { Food: 400, Bills: 1500, Gas: 150 };
let merchantMap = JSON.parse(localStorage.getItem("merchantMap")) || {};

function switchTab(tabId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
}

window.onload = () => { updateUI(); attachListeners(); };

function attachListeners() {
  document.getElementById("add-transaction-btn").onclick = addTransaction;
  document.getElementById("search-transactions").oninput = searchTransactions;
  document.getElementById("desc").onblur = autoSuggestCategory;
}

function autoSuggestCategory() {
  const desc = document.getElementById("desc").value.trim();
  if (merchantMap[desc]) {
    document.getElementById("category-select").value = merchantMap[desc];
  }
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

function addTransaction() {
  const desc = document.getElementById("desc").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type-select").value;
  const category = document.getElementById("category-select").value;
  const note = document.getElementById("note").value.trim();

  if (!desc || isNaN(amount)) return;

  // Save merchant preference
  merchantMap[desc] = category;
  
  transactions.push({ 
    desc, amount, type, category, note, 
    date: new Date().toLocaleDateString(),
    month: new Date().getMonth() 
  });

  // Clear inputs
  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("note").value = "";
  updateUI();
}

function updateUI() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("caps", JSON.stringify(caps));
  localStorage.setItem("merchantMap", JSON.stringify(merchantMap));
  
  // Update Merchant Datalist
  document.getElementById("merchant-list").innerHTML = Object.keys(merchantMap).map(m => `<option value="${m}">`).join('');

  // Update Category Select
  document.getElementById("category-select").innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');

  // Update Setup Lists
  document.getElementById("custom-cat-list").innerHTML = categories.map(c => `
    <div class="tag">${c} <span onclick="deleteCategory('${c}')">×</span></div>
  `).join('');

  document.getElementById("cap-inputs").innerHTML = categories.map(c => `
    <div class="cap-input-row"><span>${c}</span><input type="number" onchange="updateCap('${c}', this.value)" value="${caps[c] || 0}"></div>
  `).join('');

  renderDashboard();
  renderTransactions();
}

function updateCap(cat, val) { caps[cat] = parseFloat(val); localStorage.setItem("caps", JSON.stringify(caps)); renderDashboard(); }

function renderDashboard() {
  const currentMonth = new Date().getMonth();
  const thisMonthT = transactions.filter(t => t.month === currentMonth);
  
  const inc = thisMonthT.reduce((a, t) => t.type === 'income' ? a + t.amount : a, 0);
  const exp = thisMonthT.reduce((a, t) => t.type === 'expense' ? a + t.amount : a, 0);
  const inv = thisMonthT.reduce((a, t) => t.type === 'invest' ? a + t.amount : a, 0);
  
  const bank = transactions.reduce((a, t) => t.type === 'income' ? a + t.amount : (t.type === 'expense' || t.type === 'invest' ? a - t.amount : a), 0);
  
  document.getElementById("balance").innerText = `$${bank.toLocaleString()}`;
  document.getElementById("safe-spend").innerText = `$${Math.max(0, bank - (caps["Bills"] || 0)).toLocaleString()}`;
  document.getElementById("net-flow").innerText = `$${(inc - exp).toLocaleString()}`;
  document.getElementById("net-flow").style.color = (inc - exp) >= 0 ? "#4CAF50" : "#ff4444";

  // Bars
  const max = Math.max(inc, exp, 1);
  document.getElementById("bar-income").style.height = `${(inc / max) * 100}%`;
  document.getElementById("bar-expense").style.height = `${(exp / max) * 100}%`;

  const catTotals = {};
  thisMonthT.filter(t => t.type === 'expense').forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });

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
      <div><b>${t.desc}</b><br><small>${t.category} • ${t.date}</small>
      ${t.note ? `<br><i style="font-size:10px; color:#555;">${t.note}</i>` : ''}</div>
      <div style="text-align:right">
        <b class="${t.type}">$${t.amount}</b><br>
        <button class="del-small" onclick="transactions.splice(${i},1);updateUI();">×</button>
      </div>
    </li>
  `).reverse().join('');
}

function searchTransactions() {
  const term = document.getElementById("search-transactions").value.toLowerCase();
  document.querySelectorAll(".t-item").forEach(li => li.style.display = li.innerText.toLowerCase().includes(term) ? "flex" : "none");
}
