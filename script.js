let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let categories = ["Food", "Bills", "Gas", "Personal", "Health"];
let currentType = 'expense';

function switchTab(tabId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  document.getElementById('header-title').innerText = tabId === 'dashboard' ? 'Summary' : 'History';
}

function toggleSheet() {
  document.getElementById('action-sheet').classList.toggle('open');
}

function setType(type, btn) {
  currentType = type;
  document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

window.onload = () => {
  const sel = document.getElementById("category-select");
  sel.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
  updateUI();
};

document.getElementById("add-transaction-btn").onclick = () => {
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  if(!desc || isNaN(amount)) return;
  
  transactions.push({ desc, amount, type: currentType, category: document.getElementById("category-select").value, date: 'Today' });
  localStorage.setItem("transactions", JSON.stringify(transactions));
  
  toggleSheet();
  updateUI();
  // Reset inputs
  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";
};

function updateUI() {
  const inc = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const exp = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const inv = transactions.filter(t => t.type === 'invest').reduce((a, t) => a + t.amount, 0);
  const cash = inc - exp - inv;

  document.getElementById("balance").innerText = `$${cash.toLocaleString()}`;
  document.getElementById("invested-val").innerText = `$${inv.toLocaleString()}`;
  document.getElementById("net-worth").innerText = `$${(cash + inv).toLocaleString()}`;

  document.getElementById("transaction-list").innerHTML = transactions.map(t => `
    <div class="ios-list-item">
      <span>${t.desc}</span>
      <b class="${t.type}">${t.type === 'expense' ? '-' : '+'}$${t.amount}</b>
    </div>
  `).reverse().join('');
}
