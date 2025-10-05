const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const search = document.getElementById('search');
const monthFilter = document.getElementById('monthFilter');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Chart instance
let chart;

// Add Transaction
function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === '' || amount.value.trim() === '') {
    alert('Please add description and amount');
  } else {
    const transaction = {
      id: Date.now(),
      text: text.value,
      amount: +amount.value,
      date: new Date().toISOString()
    };

    transactions.push(transaction);
    updateLocalStorage();
    init();

    text.value = '';
    amount.value = '';
  }
}

// Add transaction to DOM
function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const item = document.createElement('li');
  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
  const date = new Date(transaction.date).toLocaleDateString();
  
  item.innerHTML = `
    ${transaction.text} <span>${sign}₹${Math.abs(transaction.amount)} | ${date}</span>
    <button onclick="removeTransaction(${transaction.id})">x</button>
  `;
  list.appendChild(item);
}

// Update values
function updateValues(filtered = transactions) {
  const amounts = filtered.map(t => t.amount);
  const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);
  const income = amounts.filter(i => i > 0).reduce((acc, item) => acc + item, 0).toFixed(2);
  const expense = (amounts.filter(i => i < 0).reduce((acc, item) => acc + item, 0) * -1).toFixed(2);

  balance.innerText = `₹${total}`;
  money_plus.innerText = `+₹${income}`;
  money_minus.innerText = `-₹${expense}`;

  updateChart(income, expense);
}

// Remove transaction
function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateLocalStorage();
  init();
}

// Local storage
function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Filters
function filterTransactions() {
  let filtered = [...transactions];

  // Search filter
  if (search.value.trim() !== '') {
    filtered = filtered.filter(t => 
      t.text.toLowerCase().includes(search.value.toLowerCase())
    );
  }

  // Month filter
  if (monthFilter.value) {
    const [year, month] = monthFilter.value.split("-");
    filtered = filtered.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === +year && d.getMonth() + 1 === +month;
    });
  }

  return filtered;
}

// Init app
function init() {
  list.innerHTML = '';
  const filtered = filterTransactions();
  filtered.forEach(addTransactionDOM);
  updateValues(filtered);
}

// Chart.js
function updateChart(income, expense) {
  const ctx = document.getElementById('myChart').getContext('2d');
  if (chart) chart.destroy(); // destroy old chart

  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        data: [income, expense],
        backgroundColor: ['#2ecc71', '#e74c3c']
      }]
    }
  });
}

// Events
form.addEventListener('submit', addTransaction);
search.addEventListener('input', init);
monthFilter.addEventListener('change', init);

// Init on load
init();
