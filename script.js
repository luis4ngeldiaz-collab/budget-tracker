let goals = JSON.parse(localStorage.getItem("goals")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let caps = JSON.parse(localStorage.getItem("caps")) || { Food: 400, Bills: 1500, Shopping: 200, Personal: 100 };

function switchTab(tabId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
}

window.onload = () => { 
  renderCapInputs(); 
  saveAndRefresh(); 
  attachEventListeners(); 
};

function attachEventListeners() {
  document.body.addEventListener("click", e => {
    const btn = e.target.closest('button');
    if (!btn || !btn.dataset.action) return;
    const { action, index, id } = btn.dataset;
    if (action === "delete-transaction") deleteTransaction(parseInt(index));
    if (action === "delete-goal") deleteGoal(parseInt(id));
  });
  document.getElementById("add-goal-btn").onclick = addGoal;
  document.getElementById("add-transaction-btn").onclick = addTransaction;
  document.getElementById("search-transactions").oninput = searchTransactions;
}

function renderCapInputs() {
  const container = document.getElementById("cap-inputs");
  container.innerHTML = Object.entries(caps).map(([cat, val]) => `
    <div class="cap-input-row">
      <label>${cat}</label>
      <input type="number" data-cat="${cat}" value="${val}">
    </div>
  `).join('');
}

function saveCaps() {
  document.querySelectorAll("#cap-inputs input").forEach(input => {
    caps[input.dataset.cat] = parseFloat(input.value) || 0;
  });
  localStorage.setItem("caps", JSON.stringify(caps));
  saveAndRefresh();
  alert("Budget caps updated!");
}

function addGoal() {
  const name = document.getElementById("goal-name").value;
  const amount = parseFloat(document.getElementById("goal-amount").value);
  if (!name || isNaN(amount)) return;
  goals.push({ id: Date.now(), name, target: amount, progress: 0 });
  saveAndRefresh();
}

function deleteGoal(id) {
  if (confirm("Delete Goal?")) {
    goals = goals.filter(g => g.id !== id);
    saveAndRefresh();
  }
}

function addTransaction() {
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type-select").value;
  const category = document.getElementById("category-select").value;
  const goalId = document.getElementById("goal-select").value;

  if (!desc || isNaN(amount)) return;
  transactions.push({ desc, amount, type, category, goalId, date: new Date().toLocaleDateString() });
  
  if (goalId && type === "invest") {
    const g = goals.find(g => g.id == goalId);
    if (g) g.progress += amount;
  }
  saveAndRefresh();
}

function deleteTransaction(index) {
  const t = transactions[index];
  if (t.goalId && t.type === "invest") {
    const g = goals.find(g => g.id == t.goalId);
    if (g) g.progress -= t.amount;
  }
  transactions.splice(index, 1);
  saveAndRefresh();
}

function saveAndRefresh() {
  localStorage.setItem("goals", JSON.stringify(goals));
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderDashboard(); renderGoals(); renderTransactions(); updateGoalSelect();
}

function renderDashboard() {
  const inc = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const exp = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const inv = transactions.filter(t => t.type === 'invest').reduce((a, t) => a + t.amount, 0);
  
  const bankBalance = inc - exp - inv;
  const billCap = caps["Bills"] || 0;
  
  document.getElementById("balance").innerText = `$${bankBalance.toLocaleString()}`;
  document.getElementById("invested-val").innerText = `$${inv.toLocaleString()}`;
  document.getElementById("safe-spend").innerText = `$${Math.max(0, bankBalance - billCap).toLocaleString()}`;

  const max = Math.max(inc, exp, inv, 1);
  document.getElementById("bar-income").style.height = `${(inc / max) * 100}%`;
  document.getElementById("bar-expense").style.height = `${(exp / max) * 100}%`;
  document.getElementById("bar-invest").style.height = `${(inv / max) * 100}%`;

  const catTotals = {};
  transactions.filter(t => t.type === 'expense').forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });
  
  document.getElementById("category-bars").innerHTML = Object.entries(caps).map(([cat, cap]) => {
    const spent = catTotals[cat] || 0;
    const pct = Math.min((spent / cap) * 100, 100).toFixed(0);
    const color = pct >= 100 ? '#ff4444' : (pct > 80 ? '#ffa000' : '#4CAF50');
    return `
      <div class="cat-row">
        <span>${cat}</span>
        <div class="progress"><div class="progress-bar" style="width:${pct}%; background:${color}"></div></div>
        <b>$${spent}/$${cap}</b>
      </div>`;
  }).join('');
}

function renderGoals() {
  document.getElementById("goal-list").innerHTML = goals.map(g => {
    const pct = Math.min((g.progress/g.target)*100, 100).toFixed(0);
    return `
      <div class="card goal-item">
        <h4>${g.name}</h4>
        <p>$${g.progress} / $${g.target}</p>
        <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>
        <button class="delete-btn" data-action="delete-goal" data-id="${g.id}">Delete</button>
      </div>`;
  }).join('');
}

function renderTransactions() {
  document.getElementById("transaction-list").innerHTML = transactions.map((t, i) => `
    <li class="t-item">
      <div><b>${t.desc}</b><br><small>${t.category} • ${t.date}</small></div>
      <div style="text-align:right">
        <b class="${t.type}">$${t.amount}</b><br>
        <button class="del-small" data-action="delete-transaction" data-index="${i}">×</button>
      </div>
    </li>
  `).reverse().join('');
}

function updateGoalSelect() {
  let html = '<option value="">Link to Investment Goal?</option>';
  goals.forEach(g => html += `<option value="${g.id}">${g.name}</option>`);
  document.getElementById("goal-select").innerHTML = html;
}

function searchTransactions() {
  const term = document.getElementById("search-transactions").value.toLowerCase();
  document.querySelectorAll(".t-item").forEach(li => {
    li.style.display = li.innerText.toLowerCase().includes(term) ? "flex" : "none";
  });
}
