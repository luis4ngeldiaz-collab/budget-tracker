let selectedCat = "Other";
const quickCats = [
    {n: "Food", i: "🍔"}, {n: "Gas", i: "⛽"}, 
    {n: "Bills", i: "📄"}, {n: "Shop", i: "🛒"}, 
    {n: "Work", i: "💼"}, {n: "Fun", i: "🎲"}
];

function setType(t) {
    mode = t;
    document.getElementById('btn-exp').classList.toggle('active', t === 'expense');
    document.getElementById('btn-inc').classList.toggle('active', t === 'income');
}

// Renders the tappable bubbles
function renderTags() {
    const container = document.getElementById('tag-container');
    container.innerHTML = quickCats.map(c => `
        <div class="tag ${selectedCat === c.n ? 'active' : ''}" onclick="selectTag('${c.n}')">
            ${c.i} ${c.n}
        </div>
    `).join('');
}

function selectTag(name) {
    selectedCat = name;
    renderTags();
}

function saveNow() {
    const d = document.getElementById('desc').value || selectedCat;
    const a = parseFloat(document.getElementById('amount').value);
    const n = document.getElementById('note').value;
    const dt = document.getElementById('entry-date').value || new Date().toLocaleDateString();

    if(isNaN(a)) return alert("Enter an amount!");

    data.push({ d, a, mode, c: selectedCat, note: n, date: dt });
    localStorage.setItem("logs", JSON.stringify(data));
    
    // Reset Form
    document.getElementById('desc').value = "";
    document.getElementById('amount').value = "";
    document.getElementById('note').value = "";
    closeSheet();
    refresh();
}

window.onload = () => {
    document.getElementById('entry-date').valueAsDate = new Date();
    renderTags();
    refresh();
};
