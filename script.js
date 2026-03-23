let logs = JSON.parse(localStorage.getItem("money_logs")) || [];
let currentType = 'expense';
let selectedTag = 'Other';
const tags = ["🍔 Food", "⛽ Gas", "🏠 Bills", "🛒 Shop", "💼 Work"];

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function openSheet() {
    document.getElementById('add-sheet').classList.add('open');
    document.getElementById('overlay').classList.add('active');
}

function closeSheet() {
    document.getElementById('add-sheet').classList.remove('open');
    document.getElementById('overlay').classList.remove('active');
}

function setType(t) {
    currentType = t;
    document.getElementById('btn-exp').classList.toggle('active', t === 'expense');
    document.getElementById('btn-inc').classList.toggle('active', t === 'income');
}

function saveNow() {
    const amt = parseFloat(document.getElementById('amount').value);
    const desc = document.getElementById('desc').value || selectedTag;
    
    if(isNaN(amt)) return alert("Enter an amount!");

    logs.push({ amt, desc, type: currentType, tag: selectedTag, date: new Date().toLocaleDateString() });
    localStorage.setItem("money_logs", JSON.stringify(logs));
    
    document.getElementById('amount').value = "";
    document.getElementById('desc').value = "";
    closeSheet();
    update();
}

function update() {
    const spent = logs.filter(l => l.type === 'expense').reduce((s, l) => s + l.amt, 0);
    const earned = logs.filter(l => l.type === 'income').reduce((s, l) => s + l.amt, 0);
    document.getElementById('safe-spend').innerText = `$${(earned - spent).toLocaleString()}`;
    
    document.getElementById('history-list').innerHTML = logs.map(l => `
        <div style="background:#1C1C1E; padding:15px; border-radius:12px; margin-bottom:10px; display:flex; justify-content:space-between;">
            <span>${l.desc}</span>
            <b style="color:${l.type==='expense'?'#FF453A':'#30D158'}">${l.type==='expense'?'-':'+'}$${l.amt}</b>
        </div>
    `).reverse().join('');
}

window.onload = () => {
    const tagBox = document.getElementById('tag-container');
    tagBox.innerHTML = tags.map(t => `<div class="tag" onclick="selectedTag='${t}'; this.parentElement.querySelectorAll('.tag').forEach(x=>x.classList.remove('active')); this.classList.add('active')">${t}</div>`).join('');
    update();
};
