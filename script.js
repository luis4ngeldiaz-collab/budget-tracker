let goals = JSON.parse(localStorage.getItem("goals")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function switchTab(tabId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
}

window.onload = function() {
  saveAndRefresh();
  attachEventListeners();
};

function attachEventListeners() {
  document.body.addEventListener("click", e => {
    const btn = e.target.closest('button');
    if (!btn || !btn.dataset.action) return;
    const action = btn.dataset.action;
    const id = parseInt(btn.dataset.id);
    const index = parseInt(btn.dataset.index);
    if (action === "delete-goal") deleteGoal(id);
    if (action === "edit-goal") editGoalPrompt(id);
    if (action === "delete-transaction") deleteTransaction(index);
  });

  document.getElementById("add-goal-btn").onclick = addGoal;
  document.getElementById("add-transaction-btn").onclick = addTransaction;
  document.getElementById("search-transactions").oninput = searchTransactions;
}

function addGoal() {
  const name = document.getElementById("goal-name").value;
  const amount = parseFloat(document.getElementById("goal-amount").value);
  const priority = document.getElementById("goal-priority").value;
  if (!name || isNaN(amount)) return alert("Fill in all goal fields!");
  goals.push({ id: Date.now(), name, target: amount, progress: 0, priority });
  document.getElementById("goal-name").value = "";
  document.getElementById("goal-amount").value = "";
  saveAndRefresh();
}

function deleteGoal(id) {
  if (confirm("Delete this goal?")) {
    goals = goals.filter(g => g.id !== id);
    saveAndRefresh();
  }
}

function editGoalPrompt(id) {
  const g = goals.find(g => g.id === id);
  const newName = prompt("New name:", g.name);
  const newAmount = parseFloat(prompt("New target:", g.target));
  if (newName && !isNaN(newAmount)) {
    g.name = newName; g.target = newAmount;
    saveAndRefresh();
  }
}

function addTransaction() {
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const goalId = document.getElementById("goal-select").value;
  if (!desc || isNaN(amount)) return alert("Enter details!");
  const t = { desc, amount, category, goalId, date: new Date().toLocaleDateString() };
  transactions.push(t);
  if (goalId && category === "income") {
    const goal = goals.find(g => g.id == goalId);
    if (goal) goal.progress += amount;
  }
  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";
  saveAndRefresh();
}

function deleteTransaction(index) {
  const t = transactions[index];
  if (t.goalId && t.category === "income") {
    const goal = goals.find(g => g.id == t.goalId);
    if (goal) goal.progress -= t.amount;
  }
  transactions.splice(index, 1);
  saveAndRefresh();
}

function saveAndRefresh() {
  localStorage.setItem("goals", JSON.stringify(goals));
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderDashboard();
  renderGoals();
  renderTransactions();
  updateGoalSelect();
}

function renderDashboard() {
  const inc = transactions.filter(t => t.category === 'income').reduce((a, t) => a + t.amount, 0);
  const exp = transactions.filter(t => t.category === 'expense').reduce((a, t) => a + t.amount, 0);
  const total = inc - exp;
  document.getElementById("balance").innerText = `$${total.toLocaleString()}`;
  const max = Math.max(inc, exp, 1);
  document.getElementById("bar-income").style.height = `${(inc / max) * 100}%`;
  document.getElementById("bar-expense").style.height = `${(exp / max) * 100}%`;
  const margin = inc > 0 ? ((total / inc) * 100).toFixed(0) : 0;
  document.getElementById("margin-text").innerText = `Profit Margin: ${margin}%`;
  if (goals.length > 0) {
    const rem = goals[0].target - goals[0].progress;
    document.getElementById("daily-target").innerText = `$${(rem / 14).toFixed(2)} (Next 14 Days)`;
  }
}

function renderGoals() {
  const containers = [document.getElementById("goal-list"), document.getElementById("dashboard-goals")];
  let html = "";
  goals.forEach(g => {
    const pct = Math.min((g.progress / g.target) * 100, 100).toFixed(0);
    html += `<div class="card"><h3>${g.name} (${g.priority})</h3><p>$${g.progress} / $${g.target}</p><div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div><div class="button-group"><button class="edit-btn" data-action="edit-goal" data-id="${g.id}">Edit</button><button class="delete-btn" data-action="delete-goal" data-id="${g.id}">Delete</button></div></div>`;
  });
  containers.forEach(c => c.innerHTML = html);
}

function renderTransactions() {
  const ul = document.getElementById("transaction-list");
  let html = "";
  transactions.forEach((t, i) => {
    html += `<li class="transaction-item"><div><strong>${t.desc}</strong><br><small>${t.date}</small></div><div class="${t.category}">$${t.amount}</div><button class="delete-btn" data-action="delete-transaction" data-index="${i}">Delete</button></li>`;
  });
  ul.innerHTML = html;
}

function updateGoalSelect() {
  const select = document.getElementById("goal-select");
  let html = '<option value="">Link to Goal?</option>';
  goals.forEach(g => html += `<option value="${g.id}">${g.name}</option>`);
  select.innerHTML = html;
}

function searchTransactions() {
  const term = document.getElementById("search-transactions").value.toLowerCase();
  document.querySelectorAll("#transaction-list li").forEach(li => {
    li.style.display = li.innerText.toLowerCase().includes(term) ? "flex" : "none";
  });
}
