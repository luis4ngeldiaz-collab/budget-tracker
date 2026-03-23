let data = JSON.parse(localStorage.getItem("logs")) || [];
let cats = ["Food", "Bills", "Gas", "Fun"];
let mode = 'expense';

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
    mode = t;
    document.getElementById('btn-exp').classList.remove('active');
    document.getElementById('btn-inc').classList.remove('active');
    if(t === 'expense') document.getElementById('btn-exp').classList.add('active');
    else document.getElementById('btn-inc').classList.add('active');
}

function saveNow() {
    const d = document.getElementById('desc').value;
    const a = parseFloat(document.getElementById('amount').value);
    const c = document.getElementById('cat-select').value;

    if(!d || isNaN(a)) return alert("Fill it out!");

    data.push({ d, a, mode, c, date: new Date().toLocaleDateString() });
    localStorage.setItem("logs", JSON.stringify(data));
    
    document.getElementById('desc').value = "";
    document.getElementById('amount').value = "";
    closeSheet();
    refresh();
}

function refresh() {
    const spent = data.filter(x => x.mode === 'expense').reduce((s, x) => s + x.a, 0);
    const earned = data.filter(x => x.mode === 'income').reduce((s, x) => s + x.a, 0);
    
    document.getElementById('safe-spend').innerText = `$${(earned - spent).toLocaleString()}`;

    // History
    document.getElementById('history-list').innerHTML = data.map(x => `
        <div class="item"><span>${x.d}</span><b>${x.mode==='expense'?'-':'+'}$${x.a}</b></div>
    `).reverse().join('');

    // Quick Bars
    document.getElementById('bar-container').innerHTML = [20, 50, 10, 80, 30, 90, 40].map(h => `
        <div class="bar"><div style="height:${h}%; background:#0A84FF; border-radius:4px;"></div></div>
    `).join('');
}

window.onload = () => {
    document.getElementById('cat-select').innerHTML = cats.map(c => `<option>${c}</option>`).join('');
    refresh();
};
