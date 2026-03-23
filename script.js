let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let categories = ["Food", "Bills", "Gas", "Personal", "Work"];
let currentType = 'expense';

// 1. Tab Switcher (Home vs History)
function switchTab(tabId) {
  console.log("Switching to: " + tabId);
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  document.getElementById('header-title').innerText = (tabId === 'dashboard') ? "My Money" : "History";
}

// 2. Pop-up Toggle
function toggleSheet() {
  console.log("Toggling Sheet");
  document.getElementById('action-sheet').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('active');
}

// 3. Selection Toggle (Spent/Earned/Saved)
function pickType(type) {
  console.log("Picked Type: " + type);
  currentType = type;
  // Remove 'active' from all, add to chosen one
  document.getElementById('btn-exp').classList.remove('active');
  document.getElementById('btn-inc').classList.remove('active');
  document.getElementById('btn-inv').classList.remove('active');
  
  if(type === 'expense') document.getElementById('btn-exp').classList.add('active');
  if(type === 'income') document.getElementById('btn-inc').classList.add('active');
  if(type === 'invest') document.getElementById('btn-inv').classList.add('active');
}

// 4. The SAVE Button
function saveEntry() {
  const desc = document.getElementById("desc").value;
  const amt = parseFloat(document.getElementById("amount").value);
  const cat = document.getElementById("category-select").value;

  if(!desc || isNaN(amt)) {
    alert("Please enter a name and amount!");
    return;
  }

  const newEntry = { 
    desc, 
    amount: amt, 
    type: currentType, 
    category: cat, 
    date: new Date().toLocaleDateString() 
  };

  transactions.push(newEntry);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  
  // Clean up
  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";
  toggleSheet();
  updateUI();
}

function updateUI() {
  // Update numbers
  const inc = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const exp = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const inv = transactions.filter(t => t.type === 'invest').reduce((a, t) => a + t.amount, 0);
  
  document.getElementById("safe-spend").innerText = `$${(inc - exp - inv).toLocaleString()}`;

  // Update History List
  document.getElementById("transaction-list").innerHTML = transactions.map(t => `
    <div class="ios-list-item">
      <span>${t.desc}</span>
      <b class="${t.type}">${t.type === 'expense' ? '-' : '+'}$${t.amount}</b>
    </div>
  `).reverse().join('');
}

window.onload = () => {
  const sel = document.getElementById("category-select");
  sel.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
  updateUI();
};
