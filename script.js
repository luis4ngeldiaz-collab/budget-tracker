let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let categories = ["Food", "Bills", "Gas", "Personal", "Health", "Business"];
let currentType = 'expense';
let startY = 0;

function switchTab(tabId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  document.getElementById('header-title').innerText = tabId === 'dashboard' ? 'Summary' : 'History';
}

function toggleSheet() {
  const sheet = document.getElementById('action-sheet');
  const overlay = document.getElementById('overlay');
  sheet.classList.toggle('open');
  overlay.classList.toggle('active');
  sheet.style.transform = ""; // Reset swipe position
}

// --- SWIPE TO DISMISS LOGIC ---
const handleZone = document.getElementById('sheet-handle-zone');
const sheet = document.getElementById('action-sheet');

handleZone.addEventListener('touchstart', (e) => {
  startY = e.touches[0].clientY;
  sheet.style.transition = 'none';
}, {passive: true});

handleZone.addEventListener('touchmove', (e) => {
  let deltaY = e.touches[0].clientY - startY;
  if (deltaY > 0) {
    sheet.style.transform = `translateY(${deltaY}px)`;
  }
}, {passive: true});

handleZone.addEventListener('touchend', (e) => {
  let deltaY = e.changedTouches[0].clientY - startY;
  sheet.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
  if (deltaY > 100) {
    toggleSheet();
  } else {
    sheet.style.transform = "translateY(0)";
  }
}, {passive: true});
// --- END SWIPE LOGIC ---

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
  const cash = inc - exp - inv;
  document.getElementById("balance").innerText = `$${cash.toLocaleString()}`;
  document.getElementById("invested-val").innerText = `$${inv.toLocaleString()}`;
  document.getElementById("net-worth").innerText = `$${(cash + inv).toLocaleString()}`;
  document.getElementById("transaction-list").innerHTML = transactions.map(t => `
    <div class="ios-list-item">
      <div class="item-left">
        <div class="dot ${t.type}"></div>
        <span>${t.desc}</span>
      </div>
      <b class="${t.type}">${t.type === 'expense' ? '-' : '+'}$${t.amount}</b>
    </div>
  `).reverse().join('');
}
