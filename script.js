let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let categories = ["Food", "Bills", "Gas", "Personal", "Business"];
let currentType = 'expense';
let startY = 0;

function switchTab(tabId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  document.getElementById('header-title').innerText = tabId === 'dashboard' ? 'Summary' : 'History';
}

function toggleSheet() {
  document.getElementById('action-sheet').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('active');
}

// FIXED: Selection logic for Expense/Income/Invest
document.querySelectorAll('.seg-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentType = this.getAttribute('data-type');
  });
});

// SWIPE LOGIC
const handleZone = document.getElementById('sheet-handle-zone');
const sheet = document.getElementById('action-sheet');
handleZone.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; sheet.style.transition = 'none'; });
handleZone.addEventListener('touchmove', (e) => { 
  let deltaY = e.touches[0].clientY - startY; 
  if (deltaY > 0) sheet.style.transform = `translateY(${deltaY}px)`; 
});
handleZone.addEventListener('touchend', (e) => {
  let deltaY = e.changedTouches[0].clientY - startY;
  sheet.style.transition = 'transform 0.3s cubic-bezier(0.2, 1, 0.4, 1)';
  if (deltaY > 120) toggleSheet();
  else sheet.style.transform = "translateY(0)";
});

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
  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";
};

function updateUI() {
  const inc = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const exp = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const inv = transactions.filter(t => t.type === 'invest').reduce((a, t) => a + t.amount, 0);
  
  document.getElementById("balance").innerText = `$${(inc - exp - inv).toLocaleString()}`;
  document.getElementById("invested-val").innerText = `$${inv.toLocaleString()}`;
  document.getElementById("net-worth").innerText = `$${(inc - exp).toLocaleString()}`;

  document.getElementById("transaction-list").innerHTML = transactions.map(t => `
    <div class="ios-list-item-modern">
      <div class="item-icon ${t.type}"></div>
      <div class="item-info">
        <span class="item-name">${t.desc}</span>
        <span class="item-cat">${t.category}</span>
      </div>
      <b class="item-amount ${t.type}">${t.type === 'expense' ? '-' : '+'}$${t.amount}</b>
    </div>
  `).reverse().join('');
}
