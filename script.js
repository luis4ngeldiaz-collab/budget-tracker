let goals = JSON.parse(localStorage.getItem("goals")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// INIT
window.onload = function() {
  renderGoals();
  updateGoalSelect();
};

// ADD GOAL
function addGoal() {
  const name = document.getElementById("goal-name").value;
  const amount = parseFloat(document.getElementById("goal-amount").value);

  if (!name || isNaN(amount)) return;

  const goal = { id: Date.now(), name, target: amount, progress: 0 };
  goals.push(goal);

  save();
  renderGoals();
  updateGoalSelect();
}

// RENDER GOALS
function renderGoals() {
  const container = document.getElementById("goals");
  container.innerHTML = "";

  goals.forEach(g => {
    const percent = ((g.progress / g.target) * 100).toFixed(1);

    container.innerHTML += `
      <div class="goal">
        <h4>${g.name}</h4>
        <p>$${g.progress} / $${g.target}</p>
        <div class="progress">
          <div class="progress-bar" style="width:${percent}%"></div>
        </div>
      </div>
    `;
  });
}

// UPDATE SELECT
function updateGoalSelect() {
  const select = document.getElementById("goal-select");
  select.innerHTML = `<option value="">No Goal</option>`;

  goals.forEach(g => {
    select.innerHTML += `<option value="${g.id}">${g.name}</option>`;
  });
}

// ADD TRANSACTION
function addTransaction() {
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const goalId = document.getElementById("goal-select").value;

  if (!desc || isNaN(amount)) return;

  const t = { desc, amount, category, goalId };
  transactions.push(t);

  // ADD TO GOAL
  if (goalId && category === "income") {
    const goal = goals.find(g => g.id == goalId);
    if (goal) goal.progress += amount;
  }

  save();
  renderGoals();
}

// SAVE
function save() {
  localStorage.setItem("goals", JSON.stringify(goals));
  localStorage.setItem("transactions", JSON.stringify(transactions));
}