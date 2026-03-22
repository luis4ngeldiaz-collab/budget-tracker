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
  attachEventListeners();
};

// --- EVENT DELEGATION ---
function attachEventListeners(){
  // Goal buttons
  document.getElementById("goal-list").addEventListener("click", e=>{
    if(e.target.tagName === "BUTTON"){
      const id = parseInt(e.target.dataset.id);
      if(e.target.dataset.action==="edit") editGoalPrompt(id);
      if(e.target.dataset.action==="delete") deleteGoal(id);
    }
  });
  // Transaction buttons
  document.getElementById("transaction-list").addEventListener("click", e=>{
    if(e.target.tagName === "BUTTON"){
      const index = parseInt(e.target.dataset.index);
      if(e.target.dataset.action==="edit") editTransactionPrompt(index);
      if(e.target.dataset.action==="delete") deleteTransaction(index);
    }
  });
  // Add buttons
  document.getElementById("add-goal-btn").onclick = addGoal;
  document.getElementById("add-transaction-btn").onclick = addTransaction;
  document.getElementById("export-csv-btn").onclick = exportCSV;
  document.getElementById("export-json-btn").onclick = exportJSON;
  document.getElementById("import-json-btn").onclick = importJSON;
  document.getElementById("search-transactions").oninput = searchTransactions;
}

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

function editGoalPrompt(id){
  const g = goals.find(g=>g.id===id);
  if(!g) return;
  const newName = prompt("New goal name:", g.name);
  const newAmount = parseFloat(prompt("New target amount:", g.target));
  const newPriority = prompt("New priority (High/Medium/Low):", g.priority);
  if(!newName || isNaN(newAmount)) return alert("Invalid input!");
  g.name = newName; g.target=newAmount; g.priority=newPriority;
  save();
  renderGoals();
  renderDashboard();
  updateGoalSelect();
}

function deleteGoal(id){
  goals = goals.filter(g=>g.id!==id);
  transactions.forEach(t=>{ if(t.goalId==id) t.goalId=null; });
  save();
  renderGoals();
  renderDashboard();
  updateGoalSelect();
}

function renderGoals(){
  const container = document.getElementById("goal-list");
  const dashboardGoals = document.getElementById("dashboard-goals");
  container.innerHTML = "";
  dashboardGoals.innerHTML = "";
  goals.forEach(g=>{
    const percent = ((g.progress/g.target)*100).toFixed(1);
    container.innerHTML += `
      <div class="goal">
        <h3>${g.name} (${g.priority})</h3>
        <p>$${g.progress} / $${g.target}</p>
        <div class="progress"><div class="progress-bar" style="width:${percent}%"></div></div>
        <button data-action="edit" data-id="${g.id}">Edit</button>
        <button data-action="delete" data-id="${g.id}">Delete</button>
      </div>`;
    dashboardGoals.innerHTML += `
      <div class="goal">
        <h3>${g.name} (${g.priority})</h3>
        <p>$${g.progress} / $${g.target}</p>
        <div class="progress"><div class="progress-bar" style="width:${percent}%"></div></div>
        <button data-action="edit" data-id="${g.id}">Edit</button>
        <button data-action="delete" data-id="${g.id}">Delete</button>
      </div>`;
  });
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
    li.innerHTML = `${t.date}: ${t.desc}: $${t.amount} (${t.category}) 
      <button data-action="edit" data-index="${i}">Edit</button> 
      <button data-action="delete" data-index="${i}">Delete</button>`;
    ul.appendChild(li);
  });
}

function searchTransactions(){
  const term = document.getElementById("search-transactions").value.toLowerCase();
  document.querySelectorAll("#transaction-list li").forEach(li=>{
    li.style.display = li.innerText.toLowerCase().includes(term) ? "block" : "none";
  });
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

// --- GOAL SELECT ---
function updateGoalSelect(){
  const select = document.getElementById("goal-select");
  select.innerHTML = `<option value="">No Goal</option>`;
  goals.forEach(g=> select.innerHTML += `<option value="${g.id}">${g.name}</option>`);
}

// --- STORAGE / EXPORT / IMPORT ---
function save(){
  localStorage.setItem("goals", JSON.stringify(goals));
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function exportCSV(){alert("CSV export placeholder");}
function exportJSON(){alert("JSON export placeholder");}
function importJSON(){alert("JSON import placeholder");}