// No more mock database, login logic is simplified.

document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const fullNameInput = document.getElementById('full-name').value.trim();
    const idNumberInput = document.getElementById('id-number').value.trim();
    const errorMessage = document.getElementById('error-message');

    // Basic validation
    if (!fullNameInput || !idNumberInput) {
        errorMessage.textContent = 'Please fill in all fields.';
        return;
    }

    if (!/^\d{13}$/.test(idNumberInput)) {
        errorMessage.textContent = 'ID Number must be 13 digits.';
        return;
    }

    // Since any 13-digit number is allowed, we proceed directly if validation passes.
    errorMessage.textContent = '';
    
    // Clear any previous session data on new login
    sessionStorage.removeItem('clientData');
    
    // Store user details for the dashboard
    localStorage.setItem('loggedInClientName', fullNameInput);
    localStorage.setItem('loggedInClientId', idNumberInput);
    
    window.location.href = 'dashboard.html';
});