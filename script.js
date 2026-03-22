let goals = JSON.parse(localStorage.getItem("goals")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// --- TAB FUNCTION ---
function switchTab(tabId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
}

// --- LOAD DATA ---
window.onload = function() {
  renderGoals();
  updateGoalSelect();
  renderDashboard();
  renderTransactions();
};

// --- ADD GOAL ---
function addGoal() {
  const name = document.getElementById("goal-name").value;
  const amount = parseFloat(document.getElementById("goal-amount").value);
  if(!name || isNaN(amount)) return;
  goals.push({id:Date.now(), name, target:amount, progress:0});
  save();
  renderGoals();
  updateGoalSelect();
}

// --- RENDER GOALS ---
function renderGoals() {
  const container = document.getElementById("goal-list");
  const dashboardGoals = document.getElementById("dashboard-goals");
  container.innerHTML = "";
  dashboardGoals.innerHTML = "";
  goals.forEach(g=>{
    const percent = ((g.progress/g.target)*100).toFixed(1);
    const goalCard = `<div class="goal">
      <h3>${g.name}</h3>
      <p>$${g.progress} / $${g.target}</p>
      <div class="progress"><div class="progress-bar" style="width:${percent}%"></div></div>
    </div>`;
    container.innerHTML += goalCard;
    dashboardGoals.innerHTML += goalCard;
  });
}

// --- UPDATE GOAL SELECT ---
function updateGoalSelect() {
  const select = document.getElementById("goal-select");
  select.innerHTML = `<option value="">No Goal</option>`;
  goals.forEach(g=> select.innerHTML += `<option value="${g.id}">${g.name}</option>`);
}

// --- ADD TRANSACTION ---
function addTransaction() {
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const goalId = document.getElementById("goal-select").value;
  if(!desc || isNaN(amount)) return;

  const t = {desc, amount, category, goalId};
  transactions.push(t);

  // Link to goal
  if(goalId && category === "income") {
    const goal = goals.find(g => g.id == goalId);
    if(goal) goal.progress += amount;
  }

  save();
  renderDashboard();
  renderGoals();
  renderTransactions();
}

// --- RENDER DASHBOARD ---
function renderDashboard() {
  const total = transactions.reduce((a,t)=> t.category==='income'?a+t.amount:t.category==='expense'?a+t.amount:a,0);
  document.getElementById("balance").innerText = total;

  // Example daily target (biweekly goal)
  const activeGoal = goals[0]; // simple example
  if(activeGoal){
    const remaining = activeGoal.target - activeGoal.progress;
    const dailyTarget = (remaining / 14).toFixed(2); // next 14 days
    document.getElementById("daily-target").innerText = `$${dailyTarget}`;
  } else {
    document.getElementById("daily-target").innerText = "$0";
  }
}

// --- RENDER TRANSACTIONS ---
function renderTransactions() {
  const ul = document.getElementById("transaction-list");
  ul.innerHTML = "";
  transactions.forEach((t,i)=>{
    const li = document.createElement("li");
    li.innerHTML = `${t.desc}: $${t.amount} (${t.category}) <button onclick="deleteTransaction(${i})">Delete</button>`;
    ul.appendChild(li);
  });
}

// --- DELETE TRANSACTION ---
function deleteTransaction(index){
  const t = transactions[index];
  if(t.goalId && t.category==='income'){
    const goal = goals.find(g => g.id == t.goalId);
    if(goal) goal.progress -= t.amount;
  }
  transactions.splice(index,1);
  save();
  renderDashboard();
  renderGoals();
  renderTransactions();
}

// --- EXPORT CSV ---
function exportCSV(){
  let csv = 'Description,Amount,Category,Goal\n';
  transactions.forEach(t => csv += `${t.desc},${t.amount},${t.category},${t.goalId || 'None'}\n`);
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'budget_tracker.csv'; a.click();
}

// --- SAVE ---
function save(){
  localStorage.setItem("goals", JSON.stringify(goals));
  localStorage.setItem("transactions", JSON.stringify(transactions));
}