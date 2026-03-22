let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let balance = 0;

// Load saved transactions on start
window.onload = function() {
  transactions.forEach(t => renderTransaction(t));
  updateBalance();
};

function addTransaction() {
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);

  if (!desc || isNaN(amount)) return;

  const transaction = { id: Date.now(), desc, amount };
  transactions.push(transaction);

  renderTransaction(transaction);
  updateBalance();

  // Save to local storage
  localStorage.setItem("transactions", JSON.stringify(transactions));

  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";
}

function renderTransaction(t) {
  const li = document.createElement("li");
  li.id = t.id;
  li.innerText = `${t.desc}: $${t.amount}`;

  // Delete button
  const delBtn = document.createElement("button");
  delBtn.innerText = "Delete";
  delBtn.onclick = () => deleteTransaction(t.id);
  li.appendChild(delBtn);

  document.getElementById("list").appendChild(li);
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  document.getElementById(id).remove();
  updateBalance();
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function updateBalance() {
  balance = transactions.reduce((acc, t) => acc + t.amount, 0);
  document.getElementById("balance").innerText = balance;
}