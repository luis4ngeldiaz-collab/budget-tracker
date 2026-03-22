let goals = JSON.parse(localStorage.getItem("goals")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// --- TAB FUNCTION ---
function switchTab(tabId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
}

// --- INITIALIZE ---
window.onload = function() {
  renderGoals();
  updateGoalSelect();
  renderDashboard();
  renderTransactions();
  attachEventListeners();
};

// --- ROBUST EVENT LISTENERS ---
function attachEventListeners() {
  // Use a single listener for all list clicks (Event Delegation)
  const listIds = ["goal-list", "transaction-list", "dashboard-goals"];
  
  listIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("click", e => {
      const btn = e.target.closest('button');
      if (!btn) return;

      const action = btn.dataset.action;
      const itemId = btn.dataset.id; // For Goals
      const index = btn.dataset.index; // For Transactions

      if (action === "edit") {
        itemId ? editGoalPrompt(parseInt(itemId)) : editTransactionPrompt(parseInt(index));
      } else if (action === "delete") {
        itemId ? deleteGoal(parseInt(itemId)) : deleteTransaction(parseInt(index));
      }
    });
  });

  // Static Button Bindings
  document.getElementById("add-goal-btn").onclick = addGoal;
  document.getElementById("add-transaction-btn").onclick = addTransaction;
  document.getElementById("search-transactions").oninput = searchTransactions;
  
  // Placeholders for Export/Import
  document.getElementById("export-csv-btn").onclick = () => alert("Exporting CSV...");
  document.getElementById("export-json-btn").onclick = () => alert("Exporting JSON...");
}

// --- GOAL LOGIC ---
function addGoal() {
  const name = document.getElementById("goal-name").value;
  const amount = parseFloat(document.getElementById("goal-amount").value);
  const priority = document.getElementById("goal-priority").value;
  if (!name || isNaN(amount)) return alert("Please enter a valid name and amount.");
  
  goals.push({
    id: Date.now(), 
    name, 
    target: amount, 
    progress: 0, 
    priority, 
    startDate: new Date().toISOString().split('T')[0]
  });
  
  saveAndRefresh();
  // Clear inputs
  document.getElementById("goal-name").value = "";
  document.getElementById("goal-amount").value = "";
}

function deleteGoal(id) {
  if (!confirm("Delete this goal?")) return;
  goals = goals.filter(g => g.id !== id);
  // Unlink transactions from this goal
  transactions.forEach(t => { if (t.goalId == id) t.goalId = null; });
  saveAndRefresh();
}

function editGoalPrompt(id) {
  const g = goals.find(g => g.id === id);
  const newName = prompt("New name:", g.name);
  const newAmount = parseFloat(prompt("New target:", g.target));
  if (newName && !isNaN(newAmount)) {
    g.name = newName;
    g.target = newAmount;
    saveAndRefresh();
  }
}

// --- TRANSACTION LOGIC ---
function addTransaction() {
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const goalId = document.getElementById("goal-select").value || null;
  const date = document.getElementById("transaction-date").value || new Date().toISOString().split('T')[0];

  if (!desc || isNaN(amount)) return alert("Invalid entry.");

  const t = { desc, amount, category, goalId, date };
  transactions.push(t);

  if (goalId && category === "income") {
    const goal = goals.find(g => g.id == goalId);
    if (goal) goal.progress += amount;
  }
  
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

// --- RENDERING ---
function renderGoals() {
  const containers = [document.getElementById("goal-list"), document.getElementById("dashboard-goals")];
  let html = "";
  
  goals.forEach(g => {
    const percent = Math.min(((g.progress / g.target) * 100), 100).toFixed(1);
    html += `
      <div class="card goal-item">
        <h3>${g.name} <span class="priority-tag">${g.priority}</span></h3>
        <p>$${g.progress.toLocaleString()} / $${g.target.toLocaleString()}</p>
        <div class="progress"><div class="progress-bar" style="width:${percent}%"></div></div>
        <div class="button-group">
          <button class="edit-btn" data-action="edit" data-id="${g.id}">Edit</button>
          <button class="delete-btn" data-action="delete" data-id="${g.id}">Delete</button>
        </div>
      </div>`;
  });
  
  containers.forEach(c => { if(c) c.innerHTML = html; });
}

function renderTransactions() {
  const ul = document.getElementById("transaction-list");
  let html = "";
  transactions.forEach((t, i) => {
    html += `
      <li class="transaction-item">
        <div class="t-info">
          <strong>${t.desc}</strong><br>
          <small>${t.date} • ${t.category}</small>
        </div>
        <div class="t-amount ${t.category}">$${t.amount}</div>
        <div class="button-group">
          <button class="delete-btn" data-action="delete" data-index="${i}">Delete</button>
        </div>
      </li>`;
  });
  ul.innerHTML = html;
}

function renderDashboard() {
  const total = transactions.reduce((a, t) => 
    t.category === 'income' ? a + t.amount : t.category === 'expense' ? a - t.amount : a, 0);
  document.getElementById("balance").innerText = `$${total.toLocaleString()}`;
  
  const activeGoal = goals[0];
  if (activeGoal) {
    const remaining = activeGoal.target - activeGoal.progress;
    const dailyTarget = (remaining / 14).toFixed(2);
    document.getElementById("daily-target").innerText = `$${dailyTarget}`;
  } else {
    document.getElementById("daily-target").innerText = "$0";
  }
}

function updateGoalSelect() {
  const select = document.getElementById("goal-select");
  let html = '<option value="">No Goal</option>';
  goals.forEach(g => html += `<option value="${g.id}">${g.name}</option>`);
  select.innerHTML = html;
}

function searchTransactions() {
  const term = document.getElementById("search-transactions").value.toLowerCase();
  document.querySelectorAll("#transaction-list li").forEach(li => {
    li.style.display = li.innerText.toLowerCase().includes(term) ? "flex" : "none";
  });
}

function saveAndRefresh() {
  localStorage.setItem("goals", JSON.stringify(goals));
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderGoals();
  renderTransactions();
  renderDashboard();
  updateGoalSelect();
}
