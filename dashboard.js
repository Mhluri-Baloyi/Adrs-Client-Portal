// Function to format numbers as South African Rand
const toCurrency = (num) => `R ${num.toFixed(2)}`;

// Function to generate random client data
function generateRandomClientData(fullName) {
    const originalAmount = Math.random() * (25000 - 3000) + 3000;
    const outstandingBalance = Math.random() * originalAmount * 0.8; // outstanding is always less than original

    const paymentCount = Math.floor(Math.random() * 5) + 2; // 2 to 6 payments
    const paymentHistory = [];
    const banks = ["FNB", "Absa", "Capitec", "Standard Bank", "Nedbank", "Investec"];
    const totalPaid = originalAmount - outstandingBalance;

    for (let i = 0; i < paymentCount; i++) {
        // Generate random past date
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 365));

        paymentHistory.push({
            date: date.toISOString().split('T')[0],
            amount: (totalPaid / paymentCount) * (Math.random() * 0.4 + 0.8), // payment amounts fluctuate around the average
            bank: banks[Math.floor(Math.random() * banks.length)]
        });
    }
    
    paymentHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
        fullName: fullName.toUpperCase(),
        originalAmount,
        outstandingBalance,
        paymentHistory
    };
}

// --- Main Script Execution ---
document.addEventListener('DOMContentLoaded', () => {
    const loggedInClientId = localStorage.getItem('loggedInClientId');
    const loggedInClientName = localStorage.getItem('loggedInClientName');

    if (!loggedInClientId || !loggedInClientName) {
        window.location.href = 'index.html';
        return;
    }

    // Attempt to load client data from session storage, or generate new if not present
    let clientData = JSON.parse(sessionStorage.getItem('clientData'));
    if (!clientData) {
        clientData = generateRandomClientData(loggedInClientName);
        sessionStorage.setItem('clientData', JSON.stringify(clientData));
    }

    populateDashboard(clientData, loggedInClientId);
    setupEventListeners(clientData, loggedInClientId);
});

// Function to populate the dashboard UI with client data
function populateDashboard(data, clientId) {
    // Welcome message
    const firstName = data.fullName.split(' ')[0];
    const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    document.getElementById('welcome-message').textContent = `Welcome, ${formattedName}`;

    // Account Summary
    document.getElementById('outstanding-balance').textContent = toCurrency(data.outstandingBalance);
    document.getElementById('original-balance').textContent = toCurrency(data.originalAmount);
    document.getElementById('reference-no').textContent = clientId;

    // Payment History Table
    populatePaymentHistory(data.paymentHistory);
}

// Function to render the payment history table
function populatePaymentHistory(paymentHistory) {
    const historyTableBody = document.querySelector('#payment-history-table tbody');
    historyTableBody.innerHTML = ''; // Clear existing rows
    if (paymentHistory.length === 0) {
        historyTableBody.innerHTML = '<tr><td colspan="3">No payment history found.</td></tr>';
    } else {
        paymentHistory.forEach(payment => {
            addPaymentRowToTable(payment, false); // Add to end on initial load
        });
    }
}

// Function to add a single row to the payment history table
function addPaymentRowToTable(payment, prepend = true) {
     const historyTableBody = document.querySelector('#payment-history-table tbody');
     const row = document.createElement('tr');
     row.innerHTML = `
        <td>${payment.date}</td>
        <td>${toCurrency(payment.amount)}</td>
        <td>${payment.bank}</td>
     `;
    if (prepend) {
        historyTableBody.prepend(row);
    } else {
        historyTableBody.appendChild(row);
    }
}

// Function to set up all event listeners on the page
function setupEventListeners(clientData, clientId) {
    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('loggedInClientId');
        localStorage.removeItem('loggedInClientName');
        sessionStorage.removeItem('clientData');
        window.location.href = 'index.html';
    });

    // Modal
    const modal = document.getElementById('confirmation-modal');
    const closeBtn = document.querySelector('.close-button');
    closeBtn.onclick = () => { modal.style.display = 'none'; };
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
    
    const showModal = (message) => {
        document.getElementById('modal-message').textContent = message;
        modal.style.display = 'block';
    }

    // Payment Form
    document.getElementById('payment-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const paymentAmountInput = document.getElementById('payment-amount');
        const amount = parseFloat(paymentAmountInput.value);

        if (!amount || amount <= 0) {
             showModal('Please enter a valid positive payment amount.');
             return;
        }
        
        if (amount > clientData.outstandingBalance) {
            showModal(`Payment cannot exceed the outstanding balance of ${toCurrency(clientData.outstandingBalance)}.`);
            return;
        }

        // Update client data object
        clientData.outstandingBalance -= amount;
        const newPayment = {
            date: new Date().toISOString().split('T')[0],
            amount: amount,
            bank: 'Online Payment'
        };
        clientData.paymentHistory.unshift(newPayment); // Add to the beginning of the array

        // Save updated data to session storage
        sessionStorage.setItem('clientData', JSON.stringify(clientData));

        // Update UI
        document.getElementById('outstanding-balance').textContent = toCurrency(clientData.outstandingBalance);
        addPaymentRowToTable(newPayment, true);
        showModal(`Your payment of ${toCurrency(amount)} was successful. Thank you.`);
        e.target.reset();
    });

    // Arrangement Form
    document.getElementById('arrangement-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = document.getElementById('arrangement-amount').value;
        const date = document.getElementById('start-date').value;
        if (amount && date && parseFloat(amount) > 0) {
            showModal(`Your proposal to pay R ${parseFloat(amount).toFixed(2)} monthly starting from ${date} has been submitted for review.`);
            e.target.reset();
        } else {
            showModal('Please fill in all fields with valid values.');
        }
    });
}