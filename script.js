let goals = JSON.parse(localStorage.getItem("goals")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// --- TAB SYSTEM ---
function switchTab(tabId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
}

// --- APP START ---
window.onload = function() {
  saveAndRefresh();
  attachEventListeners();
};

// --- GLOBAL CLICK HANDLER (Event Delegation) ---
function attachEventListeners() {
  // We listen to the body for any button clicks to ensure dynamic buttons work
  document.body.addEventListener("click", e => {
    const btn = e.target.closest('button');
    if (!btn || !btn.dataset.action) return;

    const action = btn.dataset.action;
    const id = parseInt(btn.dataset.id);
    const index = parseInt(btn.dataset.index);

    if (action === "delete-goal") deleteGoal(id);
    if (action === "edit-goal") editGoalPrompt(id);
    if (action === "delete-transaction") deleteTransaction(index);
    if (action === "edit-transaction") editTransactionPrompt(index);
  });

  // Static Button Bindings
  document.getElementById("add-goal-btn").onclick = addGoal;
  document.getElementById("add-transaction-btn").onclick = addTransaction;
  document.getElementById("search-transactions").oninput = searchTransactions;
}

// --- GOAL LOGIC ---
function addGoal() {
  const name = document.getElementById("goal-name").value;
  const amount = parseFloat(document.getElementById("goal-amount").value);
  const priority = document.getElementById("goal-priority").value;
  
  if (!name || isNaN(amount)) return alert("Fill in all goal fields!");

  goals.push({
    id: Date.now(),
    name,
    target: amount,
    progress: 0,
    priority
  });
  
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
  const newName = prompt("New goal name:", g.name);
  const newAmount = parseFloat(prompt("New target amount:", g.target));
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
  const goalId = document.getElementById("goal-select").value;

  if (!desc || isNaN(amount)) return alert("Enter description and amount!");

  const t = { desc, amount, category, goalId, date: new Date().toLocaleDateString() };
  transactions.push(t);

  // Update Goal Progress if it's an Income linked to a goal
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
  // Revert goal progress if it was income
  if (t.goalId && t.category === "income") {
    const goal = goals.find(g => g.id == t.goalId);
    if (goal) goal.progress -= t.amount;
  }
  transactions.splice(index, 1);
  saveAndRefresh();
}

// --- RENDERING ENGINE ---
function saveAndRefresh() {
  localStorage.setItem("goals", JSON.stringify(goals));
  localStorage.setItem("transactions", JSON.stringify(transactions));
  
  renderDashboard();
  renderGoals();
  renderTransactions();
  updateGoalSelect();
}

function renderGoals() {
  const container = document.getElementById("goal-list");
  const dashContainer = document.getElementById("dashboard-goals");
  let html = "";

  goals.forEach(g => {
    const pct = Math.min((g.progress / g.target) * 100, 100).toFixed(0);
    html += `
      <div class="card">
        <h3>${g.name} (${g.priority})</h3>
        <p>$${g.progress} / $${g.target}</p>
        <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>
        <div class="button-group">
          <button class="edit-btn" data-action="edit-goal" data-id="${g.id}">Edit</button>
          <button class="delete-btn" data-action="delete-goal" data-id="${g.id}">Delete</button>
        </div>
      </div>`;
  });
  container.innerHTML = html;
  dashContainer.innerHTML = html;
}

function renderTransactions() {
  const ul = document.getElementById("transaction-list");
  let html = "";
  transactions.forEach((t, i) => {
    html += `
      <li>
        <strong>${t.desc}</strong>: $${t.amount} (${t.category})
        <div class="button-group">
          <button class="delete-btn" data-action="delete-transaction" data-index="${i}">Delete</button>
        </div>
      </li>`;
  });
  ul.innerHTML = html;
}

function renderDashboard() {
  const total = transactions.reduce((a, t) => 
    t.category === 'income' ? a + t.amount : t.category === 'expense' ? a - t.amount : a, 0);
  document.getElementById("balance").innerText = `$${total.toLocaleString()}`;
  
  if (goals.length > 0) {
    const remaining = goals[0].target - goals[0].progress;
    document.getElementById("daily-target").innerText = `$${(remaining / 14).toFixed(2)} (Next 2 wks)`;
  }
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
    li.style.display = li.innerText.toLowerCase().includes(term) ? "block" : "none";
  });
}
