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

// --- GOALS ---
function addGoal() {
  const name = document.getElementById("goal-name").value;
  const amount = parseFloat(document.getElementById("goal-amount").value);
  const priority = document.getElementById("goal-priority").value;
  if(!name || isNaN(amount)) return alert("Invalid goal!");
  goals.push({id:Date.now(), name, target:amount, progress:0, priority});
  save();
  renderGoals();
  updateGoalSelect();
}

function editGoal(id, newName, newAmount, newPriority){
  const g = goals.find(g=>g.id===id);
  if(g){
    g.name = newName;
    g.target = newAmount;
    g.priority = newPriority;
    save();
    renderGoals();
    renderDashboard();
    updateGoalSelect();
  }
}

function deleteGoal(id){
  goals = goals.filter(g=>g.id!==id);
  transactions.forEach(t=>{
    if(t.goalId==id) t.goalId=null;
  });
  save();
  renderGoals();
  renderDashboard();
  updateGoalSelect();
}

function renderGoals() {
  const container = document.getElementById("goal-list");
  const dashboardGoals = document.getElementById("dashboard-goals");
  container.innerHTML = "";
  dashboardGoals.innerHTML = "";
  goals.forEach(g=>{
    const percent = ((g.progress/g.target)*100).toFixed(1);
    const goalCard = `<div class="goal">
      <h3>${g.name} (${g.priority})</h3>
      <p>$${g.progress} / $${g.target}</p>
      <div class="progress"><div class="progress-bar" style="width:${percent}%"></div></div>
      <button onclick="editGoalPrompt(${g.id})">Edit</button>
      <button onclick="deleteGoal(${g.id})">Delete</button>
    </div>`;
    container.innerHTML += goalCard;
    dashboardGoals.innerHTML += goalCard;
  });
}

function editGoalPrompt(id){
  const g = goals.find(g=>g.id===id);
  const newName = prompt("New goal name:", g.name);
  const newAmount = parseFloat(prompt("New target amount:", g.target));
  const newPriority = prompt("New priority (High/Medium/Low):", g.priority);
  editGoal(id,newName,newAmount,newPriority);
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
}

function editTransactionPrompt(index){
  const t = transactions[index];
  const desc = prompt("Description:", t.desc);
  const amount = parseFloat(prompt("Amount:", t.amount));
  const category = prompt("Category:", t.category);
  transactions[index] = {...t, desc, amount, category};
  save();
  renderDashboard();
  renderGoals();
  renderTransactions();
}

function deleteTransaction(index){
  const t = transactions[index];
  if(t.goalId && t.category==="income"){
    const goal = goals.find(g=>g.id==t.goalId);
    if(goal) goal.progress -= t.amount;
  }
  transactions.splice(index,1);
  save();
  renderDashboard();
  renderGoals();
  renderTransactions();
}

function renderTransactions(){
  const ul = document.getElementById("transaction-list");
  ul.innerHTML = "";
  transactions.forEach((t,i)=>{
    const li = document.createElement("li");
    li.innerHTML = `${t.date}: ${t.desc}: $${t.amount} (${t.category}) <button onclick="editTransactionPrompt(${i})">Edit</button> <button onclick="deleteTransaction(${i})">Delete</button>`;
    ul.appendChild(li);
  });
}

function searchTransactions(){
  const term = document.getElementById("search-transactions").value.toLowerCase();
  document.querySelectorAll("#transaction-list li").forEach(li=>{
    li.style.display = li.innerText.toLowerCase().includes(term) ? "block" : "none";
  });
}

// --- GOAL SELECT ---
function updateGoalSelect(){
  const select = document.getElementById("goal-select");
  select.innerHTML = `<option value="">No Goal</option>`;
  goals.forEach(g=> select.innerHTML += `<option value="${g.id}">${g.name}</option>`);
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

// --- STORAGE ---
function save(){
  localStorage.setItem("goals", JSON.stringify(goals));
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// --- EXPORT / IMPORT CSV & JSON ---
function exportCSV(){
  let csv = 'Description,Amount,Category,Goal,Date\n';
  transactions.forEach(t=> csv+=`${t.desc},${t.amount},${t.category},${t.goalId||'None'},${t.date}\n`);
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'budget_tracker.csv';
  a.click();
}

function importCSV(){
  alert("CSV import not implemented in this demo (needs parsing).");
}

function exportJSON(){
  const blob = new Blob([JSON.stringify({transactions,goals})], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'budget_tracker.json';
  a.click();
}

function importJSON(){
  const file = document.getElementById("json-import").files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(e){
    const data = JSON.parse(e.target.result);
    if(data.transactions) transactions=data.transactions;
    if(data.goals) goals=data.goals;
    save();
    renderGoals();
    renderTransactions();
    renderDashboard();
    updateGoalSelect();
  };
  reader.readAsText(file);
}