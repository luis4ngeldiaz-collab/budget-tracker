// V7 – Trunk Upgrade

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
  checkAlerts();
};

// --- GOALS ---
function addGoal() {
  const name = document.getElementById("goal-name").value;
  const amount = parseFloat(document.getElementById("goal-amount").value);
  const priority = document.getElementById("goal-priority").value;
  if(!name || isNaN(amount)) return alert("Invalid goal!");
  goals.push({id:Date.now(), name, target:amount, progress:0, priority, startDate: new Date().toISOString().split('T')[0]});
  save();
  renderGoals();
  updateGoalSelect();
}

function renderGoals() {
  const container = document.getElementById("goal-list");
  const dashboardGoals = document.getElementById("dashboard-goals");
  container.innerHTML = "";
  dashboardGoals.innerHTML = "";
  goals.forEach(g=>{
    const percent = ((g.progress/g.target)*100).toFixed(1);
    const status = calculateGoalStatus(g);
    const goalCard = `<div class="goal">
      <h3>${g.name} (${g.priority})</h3>
      <p>$${g.progress} / $${g.target} — ${status.text}</p>
      <div class="progress" style="background: rgba(255,255,255,0.2)">
        <div class="progress-bar" style="width:${percent}%; background:${status.color}"></div>
      </div>
      <button onclick="editGoalPrompt(${g.id})">Edit</button>
      <button onclick="deleteGoal(${g.id})">Delete</button>
    </div>`;
    container.innerHTML += goalCard;
    dashboardGoals.innerHTML += goalCard;
  });
}

// --- GOAL STATUS / FORECASTING ---
function calculateGoalStatus(goal){
  const start = new Date(goal.startDate);
  const today = new Date();
  const daysElapsed = Math.ceil((today - start)/ (1000*60*60*24));
  const dailyTarget = goal.target / 14; // biweekly
  const expectedProgress = dailyTarget * daysElapsed;
  const diff = goal.progress - expectedProgress;
  if(diff >= dailyTarget) return {text: "Ahead", color: "green"};
  else if(diff >= 0) return {text: "On Track", color: "yellow"};
  else return {text: "Behind", color: "red"};
}

// --- TRANSACTIONS ---
function addTransaction(){
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const goalId = document.getElementById("goal-select").value || null;
  const date = document.getElementById("transaction-date").value || new Date().toISOString().split('T')[0];
  if(!desc || isNaN(amount)) return alert("Invalid transaction!");
  const t = {desc, amount, category, goalId, date};
  transactions.push(t);
  if(goalId && category==="income"){
    const goal = goals.find(g=>g.id==goalId);
    if(goal) goal.progress += amount;
  }
  save();
  renderDashboard();
  renderGoals();
  renderTransactions();
  checkAlerts();
}

// --- DASHBOARD ---
function renderDashboard(){
  const total = transactions.reduce((a,t)=> t.category==='income'?a+t.amount:t.category==='expense'?a-t.amount:a,0);
  document.getElementById("balance").innerText = `$${total}`;

  const activeGoal = goals[0];
  if(activeGoal){
    const remaining = activeGoal.target - activeGoal.progress;
    const dailyTarget = (remaining/14).toFixed(2);
    document.getElementById("daily-target").innerText = `$${dailyTarget}`;
  } else document.getElementById("daily-target").innerText="$0";
}

// --- ALERTS ---
function checkAlerts(){
  const alerts = [];
  goals.forEach(g=>{
    const status = calculateGoalStatus(g);
    if(status.text === "Behind") alerts.push(`Goal "${g.name}" is behind schedule!`);
  });
  const totalSpent = transactions.filter(t=>t.category==='expense').reduce((a,t)=>a+t.amount,0);
  const balance = transactions.reduce((a,t)=> t.category==='income'?a+t.amount:t.category==='expense'?a-t.amount:a,0);
  if(totalSpent > balance) alerts.push("You have overspent!");
  // Display alerts
  if(alerts.length>0) alert(alerts.join("\n"));
}

// --- SAVE ---
function save(){
  localStorage.setItem("goals", JSON.stringify(goals));
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// --- (Other V6.3 functions like edit/delete, search, export/import remain unchanged)