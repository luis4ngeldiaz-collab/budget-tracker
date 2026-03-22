let balance = 0;

function addTransaction() {
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);

  if (!desc || isNaN(amount)) return;

  balance += amount;

  document.getElementById("balance").innerText = balance;

  const li = document.createElement("li");
  li.innerText = desc + ": $" + amount;
  document.getElementById("list").appendChild(li);

  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";
}
