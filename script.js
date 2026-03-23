let goals = JSON.parse(localStorage.getItem("goals")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function switchTab(tabId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
}

window.onload = () => { saveAndRefresh(); attachEventListeners(); };

function attachEventListeners() {
  document.body.addEventListener("click", e => {
    const btn = e.target.closest('button');
    if (!btn || !btn.dataset.action) return;
    const { action, id, index } = btn.dataset;
    if (action === "delete-goal") deleteGoal(parseInt(id));
    if (action === "delete-transaction") deleteTransaction(parseInt(index));
  });

  document.getElementById("add-goal-btn").onclick = addGoal;
  document.getElementById("add-transaction-btn").onclick = addTransaction;
  document.getElementById("search-transactions").oninput = searchTransactions;
}

function addGoal() {
  const name = document.getElementById("goal-name").value;
  const amount = parseFloat(document.getElementById("goal-amount").value);
  if (!name || isNaN(amount)) return;
  goals.push({ id: Date.now(), name, target: amount, progress: 0 });
  saveAndRefresh();
}

function deleteGoal(id) {
  if (confirm("Delete?")) { goals = goals.filter(g => g.id !== id); saveAndRefresh(); }
}

function addTransaction() {
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type-select").value;
  const category = document.getElementById("category-select").value;
  const goalId = document.getElementById("goal-select").value;
  if (!desc || isNaN(amount)) return;
  transactions.push({ desc, amount, type, category, goalId, date: new Date().toLocaleDateString() });
  if (goalId && type === "income") {
    const g = goals.find(g => g.id == goalId);
    if (g) g.progress += amount;
  }
  saveAndRefresh();
}

function deleteTransaction(index) {
  const t = transactions[index];
  if (t.goalId && t.type === "income") {
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
  document.getElementById("balance").innerText = `$${(inc - exp).toLocaleString()}`;
  
  // Income/Expense Bars
  const max = Math.max(inc, exp, 1);
  document.getElementById("bar-income").style.height = `${(inc / max) * 100}%`;
  document.getElementById("bar-expense").style.height = `${(exp / max) * 100}%`;

  // Category Breakdown
  const catTotals = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });

  const catContainer = document.getElementById("category-bars");
  catContainer.innerHTML = Object.entries(catTotals).map(([cat, amt]) => {
    const pct = Math.min((amt / exp) * 100, 100).toFixed(0);
    return `<div class="cat-row"><span>${cat}</span><div class="progress"><div class="progress-bar" style="width:${pct}%; background:#555;"></div></div><b>$${amt}</b></div>`;
  }).join('');
}

function renderGoals() {
  const html = goals.map(g => {
    const pct = Math.min((g.progress/g.target)*100, 100).toFixed(0);
    return `<div class="card"><h4>${g.name}</h4><p>$${g.progress} / $${g.target}</p><div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div><button class="delete-btn" data-action="delete-goal" data-id="${g.id}">Delete</button></div>`;
  }).join('');
  document.getElementById("goal-list").innerHTML = html;
  document.getElementById("dashboard-goals").innerHTML = html;
}

function renderTransactions() {
  document.getElementById("transaction-list").innerHTML = transactions.map((t, i) => `
    <li class="t-item"><div><b>${t.desc}</b><br><small>${t.category} • ${t.date}</small></div><b class="${t.type}">$${t.amount}</b><button data-action="delete-transaction" data-index="${i}">×</button></li>
  `).reverse().join(''); // Reversed so newest is at the top
}

function updateGoalSelect() {
  let html = '<option value="">Link to Goal?</option>';
  goals.forEach(g => html += `<option value="${g.id}">${g.name}</option>`);
  document.getElementById("goal-select").innerHTML = html;
}

function searchTransactions() {
  const term = document.getElementById("search-transactions").value.toLowerCase();
  document.querySelectorAll(".t-item").forEach(li => li.style.display = li.innerText.toLowerCase().includes(term) ? "flex" : "none");
}
 