// --- Theme toggle with persistence ---
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    this.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
}

// --- Expense Tracker Functionality ---

// State
let transactions = [];
let budget = {
    type: 'Monthly',
    amount: 0
};

// Elements
const transactionsSection = document.querySelector('.transaction-section');
const transactionsList = document.createElement('ul');
transactionsList.style.listStyle = 'none';
transactionsList.style.padding = '0';
transactionsList.className = 'transactions-list';
transactionsSection.appendChild(transactionsList);

const totalMonthCard = document.querySelector('.purple-card h2');
const totalWeekCard = document.querySelector('.orange-card h2');
const budgetCard = document.querySelector('.blue-card h2');
const budgetSpentSmall = document.querySelector('.blue-card small');

// Toast
function showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = 'toast show';
    setTimeout(() => {
        toast.className = 'toast';
    }, 2000);
}

// Helpers
function formatCurrency(amount) {
    return '₦' + Number(amount).toLocaleString(undefined, {minimumFractionDigits: 2});
}
function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() + 4 - (d.getDay()||7));
    const yearStart = new Date(d.getFullYear(),0,1);
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

// Local Storage
function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('budget', JSON.stringify(budget));
}
function loadData() {
    const tx = localStorage.getItem('transactions');
    const bd = localStorage.getItem('budget');
    if (tx) transactions = JSON.parse(tx);
    if (bd) budget = JSON.parse(bd);
}

// Add Expense
window.addExpense = function() {
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);

    if (!date || !category || category === "Select a category" || !description || isNaN(amount) || amount <= 0) {
        showToast('Please fill all fields with valid values.');
        return;
    }

    transactions.push({ date, category, description, amount });
    saveData();
    updateTransactions();
    updateCards();
    document.getElementById('expense-form').reset();
    showToast('Expense added!');
};

// Add Budget
window.addBudget = function() {
    const type = document.getElementById('budgetType').value;
    const amountStr = document.getElementById('budget').value;
    const amount = parseFloat(amountStr);

    if (!amountStr || isNaN(amount) || amount <= 0) {
        showToast('Please enter a valid budget amount.');
        return;
    }

    budget.type = type;
    budget.amount = amount;
    saveData();
    updateCards();
    document.getElementById('budget').value = '';
    showToast('Budget updated!');
};

// Update Transactions List
function updateTransactions() {
    transactionsList.innerHTML = '';
    if (transactions.length === 0) {
        const p = transactionsSection.querySelector('p');
        if (p) p.style.display = '';
        return;
    }
    const p = transactionsSection.querySelector('p');
    if (p) p.style.display = 'none';
    transactions.slice().reverse().forEach((tx, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="tx-category">${tx.category}</span>
            <span class="tx-description">${tx.description}</span>
            <span class="tx-date">${tx.date}</span>
            <span class="tx-amount">${formatCurrency(tx.amount)}</span>
            <button class="tx-edit" title="Edit">&#9998;</button>
            <button class="tx-delete" title="Delete">&times;</button>
        `;
        // Delete
        li.querySelector('.tx-delete').onclick = () => {
            const realIdx = transactions.length - 1 - idx;
            transactions.splice(realIdx, 1);
            saveData();
            updateTransactions();
            updateCards();
            showToast('Transaction deleted');
        };
        // Edit
        li.querySelector('.tx-edit').onclick = () => {
            const realIdx = transactions.length - 1 - idx;
            const txToEdit = transactions[realIdx];
            document.getElementById('date').value = txToEdit.date;
            document.getElementById('category').value = txToEdit.category;
            document.getElementById('description').value = txToEdit.description;
            document.getElementById('amount').value = txToEdit.amount;
            transactions.splice(realIdx, 1);
            saveData();
            updateTransactions();
            updateCards();
            showToast('Edit the fields and click Add Expense');
        };
        transactionsList.appendChild(li);
    });
}

// Update Cards (with budget progress bar)
function updateCards() {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const week = getWeekNumber(now);

    let monthTotal = 0, weekTotal = 0, spent = 0;
    transactions.forEach(tx => {
        const txDate = new Date(tx.date);
        if (txDate.getMonth() === month && txDate.getFullYear() === year) {
            monthTotal += tx.amount;
        }
        if (getWeekNumber(tx.date) === week && txDate.getFullYear() === year) {
            weekTotal += tx.amount;
        }
        spent += tx.amount;
    });

    totalMonthCard.textContent = formatCurrency(monthTotal);
    totalWeekCard.textContent = formatCurrency(weekTotal);
    budgetCard.textContent = formatCurrency(budget.amount);
    budgetSpentSmall.textContent = `${formatCurrency(spent)} spent`;

    // Budget Progress Bar
    const progressBar = document.querySelector('.budget-progress-bar');
    if (progressBar) {
        let percent = 0;
        if (budget.amount > 0) {
            percent = Math.min(100, Math.round((spent / budget.amount) * 100));
        }
        progressBar.style.width = percent + '%';
        progressBar.style.background = percent < 80 ? '#388e3c' : percent < 100 ? '#FFA726' : '#d32f2f';
    }
}

// Initialize
loadData();
updateTransactions();
updateCards();