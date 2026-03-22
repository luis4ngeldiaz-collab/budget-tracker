let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let balance = 0;

// Load saved transactions
window.onload = function() {
  transactions.forEach(t => renderTransaction(t));
  updateBalance();
  updateCategoryTotals();
  updateChart();
};

function addTransaction() {
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;

  if (!desc || isNaN(amount)) return;

  const transaction = { id: Date.now(), desc, amount, category, date: new Date() };
  transactions.push(transaction);

  renderTransaction(transaction);
  updateBalance();
  updateCategoryTotals();
  updateChart();

  localStorage.setItem("transactions", JSON.stringify(transactions));

  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";
}

// Render transaction card
function renderTransaction(t) {
  const li = document.createElement("li");
  li.id = t.id;
  li.className = t.category;
  li.innerHTML = `${t.desc}: $${t.amount} <button onclick="deleteTransaction(${t.id})">Delete</button>`;
  document.getElementById("list").appendChild(li);
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  document.getElementById(id).remove();
  updateBalance();
  updateCategoryTotals();
  updateChart();
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Update balance
function updateBalance() {
  balance = transactions.reduce((acc, t) => acc + t.amount, 0);
  document.getElementById("balance").innerText = balance;
}

// Category totals
function updateCategoryTotals() {
  const income = transactions.filter(t=>t.category==='income').reduce((a,b)=>a+b.amount,0);
  const expense = transactions.filter(t=>t.category==='expense').reduce((a,b)=>a+b.amount,0);
  const other = transactions.filter(t=>t.category==='other').reduce((a,b)=>a+b.amount,0);
  document.getElementById("total-income").innerText = income;
  document.getElementById("total-expense").innerText = expense;
  document.getElementById("total-other").innerText = other;
}

// Chart.js for income/expense
let chart = new Chart(document.getElementById('chart'), {
    type: 'bar',
    data: {
        labels: ['Income','Expense','Other'],
        datasets: [{
            label: 'Totals',
            data: [0,0,0],
            backgroundColor: ['#4CAF50','#F44336','#FFC107']
        }]
    },
    options: { responsive:true, maintainAspectRatio:false }
});

function updateChart() {
    chart.data.datasets[0].data = [
        transactions.filter(t=>t.category==='income').reduce((a,b)=>a+b.amount,0),
        transactions.filter(t=>t.category==='expense').reduce((a,b)=>a+b.amount,0),
        transactions.filter(t=>t.category==='other').reduce((a,b)=>a+b.amount,0)
    ];
    chart.update();
}

// Export CSV
function exportCSV() {
    let csv = 'Description,Amount,Category,Date\n';
    transactions.forEach(t => {
        csv += `${t.desc},${t.amount},${t.category},${t.date}\n`;
    });
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'budget_tracker.csv';
    a.click();
}