let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let categories = ["Food", "Bills", "Gas", "Personal", "Health"];
// Default limits - This is what makes it a "Real App"
let limits = JSON.parse(localStorage.getItem("limits")) || { Food: 400, Bills: 1200, Gas: 150, Personal: 200, Health: 100 };
let currentType = 'expense';

function switchTab(tabId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  if(tabId === 'setup') renderSetup();
}

function toggleSheet() {
  document.getElementById('action-sheet').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('active');
}

window.onload = () => {
  document.getElementById("category-select").innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
  updateUI();
};

document.querySelectorAll('.seg-btn').forEach(btn => {
  btn.onclick = function() {
    document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentType = this.dataset.type;
  }
});

document.getElementById("add-transaction-btn").onclick = () => {
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  if(!desc || isNaN(amount)) return;
  transactions.push({ desc, amount, type: currentType, category: document.getElementById("category-select").value, date: 'Today' });
  localStorage.setItem("transactions", JSON.stringify(transactions));
  toggleSheet();
  updateUI();
};

function renderSetup() {
    document.getElementById("limit-inputs").innerHTML = categories.map(c => `
        <div class="ios-list-item-modern">
            <span>${c} Limit</span>
            <input type="number" value="${limits[c]}" onchange="updateLimit('${c}', this.value)" class="limit-box">
        </div>
    `).join('');
}

function updateLimit(cat, val) {
    limits[cat] = parseFloat(val);
    localStorage.setItem("limits", JSON.stringify(limits));
    updateUI();
}

function updateUI() {
  const inc = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const exp = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const inv = transactions.filter(t => t.type === 'invest').reduce((a, t) => a + t.amount, 0);
  
  const cash = inc - exp - inv;
  const totalLimit = Object.values(limits).reduce((a, b) => a + b, 0);
  const safe = Math.max(0, cash - (totalLimit - exp));

  document.getElementById("balance").innerText = `$${cash.toLocaleString()}`;
  document.getElementById("invested-val").innerText = `$${inv.toLocaleString()}`;
  document.getElementById("safe-spend").innerText = `$${safe.toLocaleString()}`;

  // Dashboard Progress Bars
  const catTotals = {};
  transactions.filter(t => t.type === 'expense').forEach(t => catTotals[t.category] = (catTotals[t.category] || 0) + t.amount);

  document.getElementById("category-bars").innerHTML = categories.map(c => {
    const spent = catTotals[c] || 0;
    const limit = limits[c] || 1;
    const pct = Math.min((spent / limit) * 100, 100);
    const color = pct > 90 ? 'var(--ios-red)' : (pct > 70 ? '#FF9F0A' : var(--ios-green));
    return `
        <div class="budget-row">
            <div class="row-info"><span>${c}</span><b>$${spent} / $${limit}</b></div>
            <div class="ios-progress-container"><div class="progress-fill" style="width:${pct}%; background:${color}"></div></div>
        </div>`;
  }).join('');

  document.getElementById("transaction-list").innerHTML = transactions.map(t => `
    <div class="ios-list-item-modern">
      <div class="item-icon ${t.type}"></div>
      <div class="item-info"><b>${t.desc}</b><small>${t.category}</small></div>
      <b class="${t.type}">${t.type === 'expense' ? '-' : '+'}$${t.amount}</b>
    </div>
  `).reverse().join('');
}
