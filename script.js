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
    const { action, index, id } = btn.dataset;
    if (action === "delete-transaction") deleteTransaction(parseInt(index));
    if (action === "clear-transaction") clearTransaction(parseInt(index));
    if (action === "delete-goal") deleteGoal(parseInt(id));
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
  const status = document.getElementById("status-select").value;
  const category = document.getElementById("category-select").value;
  const goalId = document.getElementById("goal-select").value;

  if (!desc || isNaN(amount)) return;
  transactions.push({ desc, amount, type, status, category, goalId, date: new Date().toLocaleDateString(), timestamp: Date.now() });
  
  if (goalId && type === "income" && status === "cleared") {
    const g = goals.find(g => g.id == goalId);
    if (g) g.progress += amount;
  }
  saveAndRefresh();
}

function clearTransaction(index) {
  const t = transactions[index];
  t.status = "cleared";
  if (t.goalId && t.type === "income") {
    const g = goals.find(g => g.id == t.goalId);
    if (g) g.progress += t.amount;
  }
  saveAndRefresh();
}

function deleteTransaction(index) {
  const t = transactions[index];
  if (t.goalId && t.type === "income" && t.status === "cleared") {
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
  const clearedInc = transactions.filter(t => t.type === 'income' && t.status === 'cleared').reduce((a, t) => a + t.amount, 0);
  const pendingInc = transactions.filter(t => t.type === 'income' && t.status === 'pending').reduce((a, t) => a + t.amount, 0);
  const exp = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  
  document.getElementById("balance").innerText = `$${(clearedInc - exp).toLocaleString()}`;
  document.getElementById("pending-val").innerText = `$${pendingInc.toLocaleString()}`;

  // Burn Rate Logic (Last 30 days)
  if (transactions.length > 0) {
    const firstDate = transactions[0].timestamp;
    const daysActive = Math.max(1, Math.ceil((Date.now() - firstDate) / (1000 * 60 * 60 * 24)));
    document.getElementById("burn-rate").innerText = `$${(exp / daysActive).toFixed(0)}`;
  }

  const max = Math.max(clearedInc, exp, 1);
  document.getElementById("bar-income").style.height = `${(clearedInc / max) * 100}%`;
  document.getElementById("bar-expense").style.height = `${(exp / max) * 100}%`;

  const catTotals = {};
  transactions.filter(t => t.type === 'expense').forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });
  document.getElementById("category-bars").innerHTML = Object.entries(catTotals).map(([cat, amt]) => {
    const pct = Math.min((amt / Math.max(exp, 1)) * 100, 100).toFixed(0);
    return `<div class="cat-row"><span>${cat}</span><div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div><b>$${amt}</b></div>`;
  }).join('');
}

function renderGoals() {
  document.getElementById("goal-list").innerHTML = goals.map(g => {
    const pct = Math.min((g.progress/g.target)*100, 100).toFixed(0);
    return `<div class="card"><h4>${g.name}</h4><p>$${g.progress} / $${g.target}</p><div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div><button class="delete-btn" data-action="delete-goal" data-id="${g.id}">Delete</button></div>`;
  }).join('');
}

function renderTransactions() {
  document.getElementById("transaction-list").innerHTML = transactions.map((t, i) => `
    <li class="t-item">
      <div><b>${t.desc}</b><br><small>${t.category} • ${t.status}</small></div>
      <div style="text-align:right">
        <b class="${t.type}">$${t.amount}</b><br>
        ${t.status === 'pending' ? `<button class="clear-btn" data-action="clear-transaction" data-index="${i}">Clear</button>` : ''}
        <button class="del-small" data-action="delete-transaction" data-index="${i}">×</button>
      </div>
    </li>
  `).reverse().join('');
}

function updateGoalSelect() {
  let html = '<option value="">Link to Goal?</option>';
  goals.forEach(g => html += `<option value="${g.id}">${g.name}</option>`);
  document.getElementById("goal-select").innerHTML = html;
}

function generateBackup() {
  const data = { goals, transactions };
  const code = btoa(JSON.stringify(data)); // Simple Base64 encode
  const box = document.getElementById("backup-box");
  box.value = code;
  box.readOnly = false;
  box.select();
  document.execCommand("copy");
  box.readOnly = true;
  alert("Backup code copied to clipboard! Save it in your Notes.");
}

function restoreBackup() {
  const code = prompt("Paste your backup code here:");
  if (!code) return;
  try {
    const data = JSON.parse(atob(code));
    goals = data.goals || [];
    transactions = data.transactions || [];
    saveAndRefresh();
    alert("Data restored successfully!");
  } catch (e) { alert("Invalid backup code."); }
}

function searchTransactions() {
  const term = document.getElementById("search-transactions").value.toLowerCase();
  document.querySelectorAll(".t-item").forEach(li => li.style.display = li.innerText.toLowerCase().includes(term) ? "flex" : "none");
}
