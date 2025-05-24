// Array to store transaction history
let transactions = [];
let withdrawalInProgress = false; // Track withdrawal state

// Function to format date
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'numeric', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
    };
    return date.toLocaleString('en-US', options);
}

// Function to add a transaction to history
function addTransaction(type, amount, balance, recipient = '', source = '') {
    const date = new Date();
    const transaction = {
        date: formatDate(date),
        type: type,
        amount: amount,
        balance: balance,
        recipient: recipient,
        source: source
    };
    transactions.unshift(transaction);
    updateTransactionHistory();
}

// Function to update the transaction history display
function updateTransactionHistory() {
    const list = document.getElementById('transactions-list');
    list.innerHTML = '';
    
    transactions.forEach((transaction, index) => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        item.style.borderLeft = `4px solid ${transaction.type === 'Credit' ? '#2ecc71' : '#e74c3c'}`;
        
        const transactionNumber = document.createElement('div');
        transactionNumber.style.fontWeight = 'bold';
        transactionNumber.style.marginBottom = '5px';
        transactionNumber.textContent = `${index + 1}.`;
        
        const details = document.createElement('div');
        details.className = 'transaction-details';
        
        if (transaction.type === 'Debit' && transaction.recipient) {
            details.innerHTML = `Transfer to <strong>${transaction.recipient}</strong> | 
                               ${transaction.date} | 
                               <span class="debit">${transaction.type}</span>`;
        } else if (transaction.type === 'Credit') {
            details.innerHTML = `Deposit from <strong>${transaction.source || 'Bank Transfer'}</strong> | 
                               ${transaction.date} | 
                               <span class="credit">${transaction.type}</span>`;
        } else if (transaction.type === 'Withdrawal') {
            details.innerHTML = `Withdrawal via <strong>${transaction.source}</strong> | 
                               ${transaction.date} | 
                               <span class="debit">${transaction.type}</span>`;
        }
        
        const amount = document.createElement('div');
        amount.className = 'transaction-amount';
        amount.style.marginTop = '5px';
        amount.innerHTML = `Amount: <strong>$${transaction.amount.toFixed(2)}</strong><br>
                          <span class="transaction-balance">New Balance: $${transaction.balance.toFixed(2)}</span>`;
        
        item.appendChild(transactionNumber);
        item.appendChild(details);
        item.appendChild(amount);
        list.appendChild(item);
    });
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Load Font Awesome
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(fontAwesome);

    // Get username from URL
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    
    if (username) {
        document.getElementById('username').textContent = username;
    } else {
        window.location.href = 'login.html';
    }
    
    // Initialize with sample transaction
    const currentBalance = parseFloat(document.getElementById('account-balance').textContent);
    addTransaction('Credit', currentBalance, currentBalance, '', 'Initial Balance');
    
    // Modal controls
    const transferBtn = document.getElementById('transfer-btn');
    const depositBtn = document.getElementById('deposit-btn');
    const withdrawBtn = document.getElementById('withdraw-btn');
    const transferModal = document.getElementById('transfer-modal');
    const depositModal = document.getElementById('deposit-modal');
    const withdrawModal = document.getElementById('withdraw-modal');
    const cancelTransfer = document.getElementById('cancel-transfer');
    const cancelDeposit = document.getElementById('cancel-deposit');
    const cancelWithdraw = document.getElementById('cancel-withdraw');
    
    // Open modals
    transferBtn.addEventListener('click', () => {
        transferModal.style.display = 'flex';
    });
    
    depositBtn.addEventListener('click', () => {
        depositModal.style.display = 'flex';
    });
    
    withdrawBtn.addEventListener('click', () => {
        withdrawModal.style.display = 'flex';
        document.getElementById('withdraw-amount').value = '';
    });
    
    // Close modals
    cancelTransfer.addEventListener('click', () => {
        transferModal.style.display = 'none';
    });
    
    cancelDeposit.addEventListener('click', () => {
        depositModal.style.display = 'none';
    });
    
    cancelWithdraw.addEventListener('click', () => {
        withdrawModal.style.display = 'none';
        withdrawalInProgress = false;
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === transferModal) {
            transferModal.style.display = 'none';
        }
        if (e.target === depositModal) {
            depositModal.style.display = 'none';
        }
        if (e.target === withdrawModal) {
            withdrawModal.style.display = 'none';
            withdrawalInProgress = false;
        }
    });
    
    // Quick amount buttons for withdrawal
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.getElementById('withdraw-amount').value = e.target.dataset.amount;
        });
    });
    
    // Transfer handler
    const confirmTransfer = document.getElementById('confirm-transfer');
    confirmTransfer.addEventListener('click', (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('transfer-amount').value);
        const recipient = document.getElementById('transfer-account').value.trim();
        const loading = document.getElementById('transfer-loading');
        const currentBalance = parseFloat(document.getElementById('account-balance').textContent);
        
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        
        if (recipient === '') {
            alert('Please enter recipient name');
            return;
        }
        
        if (amount > currentBalance) {
            alert('Insufficient funds');
            return;
        }
        
        loading.style.display = 'block';
        
        setTimeout(() => {
            const newBalance = currentBalance - amount;
            document.getElementById('account-balance').textContent = newBalance.toFixed(2);
            addTransaction('Debit', amount, newBalance, recipient);
            
            loading.style.display = 'none';
            transferModal.style.display = 'none';
            document.getElementById('transfer-amount').value = '';
            document.getElementById('transfer-account').value = '';
            
            alert(`Successfully transferred $${amount.toFixed(2)} to ${recipient}`);
        }, Math.random() * 5000 + 5000);
    });
    
    // Deposit handler
    const confirmDeposit = document.getElementById('confirm-deposit');
    confirmDeposit.addEventListener('click', (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('deposit-amount').value);
        const source = document.getElementById('deposit-source').value.trim();
        const loading = document.getElementById('deposit-loading');
        
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        
        loading.style.display = 'block';
        
        setTimeout(() => {
            const currentBalance = parseFloat(document.getElementById('account-balance').textContent);
            const newBalance = currentBalance + amount;
            document.getElementById('account-balance').textContent = newBalance.toFixed(2);
            addTransaction('Credit', amount, newBalance, '', source);
            
            loading.style.display = 'none';
            depositModal.style.display = 'none';
            document.getElementById('deposit-amount').value = '';
            document.getElementById('deposit-source').value = '';
            
            alert(`Successfully deposited $${amount.toFixed(2)}`);
        }, Math.random() * 5000 + 5000);
    });
    
    // Withdrawal handler (FIXED to persist transactions)
const confirmWithdraw = document.getElementById('confirm-withdraw');
confirmWithdraw.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (withdrawalInProgress) {
        alert('Withdrawal already in progress');
        return;
    }
    
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    const method = document.getElementById('withdraw-method').value;
    const loading = document.getElementById('withdraw-loading');
    const currentBalance = parseFloat(document.getElementById('account-balance').textContent);
    
    // Validation
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    if (amount % 2 !== 0) {
        alert('Amount must be in even amounts for withdrawals');
        return;
    }
    
    if (amount > currentBalance) {
        alert('Insufficient funds');
        return;
    }
    
    withdrawalInProgress = true;
    loading.style.display = 'block';
    confirmWithdraw.disabled = true;
    
    const originalModalContent = withdrawModal.innerHTML;
    
    const processId = setTimeout(() => {
        const newBalance = currentBalance - amount;
        document.getElementById('account-balance').textContent = newBalance.toFixed(2);
        addTransaction('Withdrawal', amount, newBalance, '', method);
        
        // Update modal to show receipt without reloading
        withdrawModal.innerHTML = `
            <div class="modal-content">
                <h3>Withdrawal Complete</h3>
                <div class="receipt">
                    <p>Amount: <strong>$${amount.toFixed(2)}</strong></p>
                    <p>Method: ${method === 'atm' ? 'ATM' : 'Bank Branch'}</p>
                    <p>Date: ${new Date().toLocaleString()}</p>
                    <p>New Balance: $${newBalance.toFixed(2)}</p>
                    <div class="modal-buttons" style="margin-top:20px;">
                        <button class="modal-btn confirm-btn" id="close-withdraw">Done</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add new event listener for the Done button
        document.getElementById('close-withdraw').addEventListener('click', () => {
            withdrawModal.style.display = 'none';
            withdrawModal.innerHTML = originalModalContent; // Restore original form
            withdrawalInProgress = false;
            confirmWithdraw.disabled = false;
        });
        
        loading.style.display = 'none';
    }, Math.random() * 5000 + 5000);
    
    // Cancel handler
    cancelWithdraw.addEventListener('click', function cancelHandler() {
        clearTimeout(processId);
        loading.style.display = 'none';
        withdrawModal.innerHTML = originalModalContent;
        withdrawalInProgress = false;
        confirmWithdraw.disabled = false;
        cancelWithdraw.removeEventListener('click', cancelHandler);
    });
});
    // Logout functionality
    document.getElementById('logout-btn').addEventListener('click', function() {
        window.location.href = 'login.html';
    });
});
