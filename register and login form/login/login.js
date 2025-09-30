document.addEventListener('DOMContentLoaded', (event) => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Perform validation
        if (username === '' || password === '') {
            alert('Please fill in all fields');
            return;
        }

        // Simulate login process
        if (username === 'admin' && password === 'password') {
            alert('Login successful');
            // Redirect to another page or perform other actions
        } else {
            alert('Invalid username or password');
        }
    });
});