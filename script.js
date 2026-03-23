let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || ["Food", "Bills", "Gas", "Personal"];
let caps = JSON.parse(localStorage.getItem("caps")) || { Food: 400, Bills: 1500 };
let goals = JSON.parse(localStorage.getItem("goals")) || [];
let merchantMap = JSON.parse(localStorage.getItem("merchantMap")) || {};

function switchTab(tabId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
}

window.onload = () => { 
  updateUI(); 
  document.getElementById("type-select").onchange = (e) => {
    document.getElementById("goal-select").style.display = (e.target.value === "invest") ? "block" : "none";
  };
};

document.getElementById("add-goal-btn").onclick = () => {
  const name = document.getElementById("goal-name").value;
  const target = parseFloat(document.getElementById("goal-amount").value);
  const image = document.getElementById("goal-image").value || "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200";
  if(name && target) {
    goals.push({ id: Date.now(), name, target, image, progress: 0 });
    updateUI();
  }
};

document.getElementById("add-transaction-btn").onclick = () => {
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type-select").value;
  const category = document.getElementById("category-select").value;
  const goalId = document.getElementById("goal-select").value;

  if(!desc || isNaN(amount)) return;
  transactions.push({ desc, amount, type, category, goalId, date: new Date().toLocaleDateString() });
  
  if(type === "invest" && goalId) {
    const g = goals.find(g => g.id == goalId);
    if(g) g.progress += amount;
  }
  updateUI();
};

function updateUI() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("goals", JSON.stringify(goals));
  
  document.getElementById("category-select").innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
  document.getElementById("goal-select").innerHTML = '<option value="">Link to Goal?</option>' + goals.map(g => `<option value="${g.id}">${g.name}</option>`).join('');

  renderDashboard();
  renderGoals();
  renderTransactions();
}

function renderDashboard() {
  const inc = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const exp = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const inv = transactions.filter(t => t.type === 'invest').reduce((a, t) => a + t.amount, 0);
  const cash = inc - exp - inv;

  document.getElementById("balance").innerText = `$${cash.toLocaleString()}`;
  document.getElementById("invested-val").innerText = `$${inv.toLocaleString()}`;
  document.getElementById("net-worth").innerText = `$${(cash + inv).toLocaleString()}`;
  document.getElementById("safe-spend").innerText = `$${Math.max(0, cash - (caps["Bills"] || 0)).toLocaleString()}`;

  // Horizontal Scroll Goals
  document.getElementById("active-goals-scroll").innerHTML = goals.map(g => {
    const pct = Math.min((g.progress/g.target)*100, 100).toFixed(0);
    return `
      <div class="goal-card" style="background-image: linear-gradient(transparent, #000), url('${g.image}')">
        <div class="goal-info">
          <span>${g.name}</span>
          <b>${pct}%</b>
        </div>
      </div>`;
  }).join('');
}

function renderGoals() {
  document.getElementById("goal-list").innerHTML = goals.map((g, i) => `
    <div class="card">
      <div class="split-row">
        <b>${g.name}</b>
        <span>$${g.progress} / $${g.target}</span>
      </div>
      <button class="del-small" onclick="goals.splice(${i},1);updateUI();">Delete Goal</button>
    </div>
  `).join('');
}

function renderTransactions() {
  document.getElementById("transaction-list").innerHTML = transactions.map((t, i) => `
    <li class="t-item">
      <div><b>${t.desc}</b><br><small>${t.category}</small></div>
      <b class="${t.type}">$${t.amount}</b>
    </li>
  `).reverse().slice(0, 5).join('');
}
