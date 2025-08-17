document.addEventListener('DOMContentLoaded', () => {
    // Store JWT token in localStorage
    function setToken(token) {
        localStorage.setItem('token', token);
    }

    function getToken() {
        return localStorage.getItem('token');
    }

    function clearToken() {
        localStorage.removeItem('token');
    }

    // Login function
    function login(username, password) {
        fetch('http://localhost:8081/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.token) {
                setToken(data.token);
                alert('Login successful');
                // Redirect or update UI accordingly
            } else {
                alert('Login failed: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(err => {
            console.error('Login error:', err);
            alert('Login error');
        });
    }

    // Logout function
    function logout() {
        clearToken();
        alert('Logged out');
        // Redirect or update UI accordingly
    }

    // Example usage: attach login form submit handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            login(username, password);
        });
    }

    // Example usage: attach logout button handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }

    // Modify fetch calls to include Authorization header if token exists
    function authFetch(url, options = {}) {
        const token = getToken();
        options.headers = options.headers || {};
        if (token) {
            options.headers['Authorization'] = 'Bearer ' + token;
        }
        return fetch(url, options);
    }

    // Example: fetch cases with authFetch
    function fetchCases() {
        authFetch('http://localhost:8081/api/cases')
            .then(response => response.json())
            .then(data => {
                console.log('Cases from backend:', data);
                const casesList = document.getElementById('cases-list');
                if (casesList) {
                    casesList.innerHTML = '';
                    data.forEach(c => {
                        const li = document.createElement('li');
                        li.textContent = `#${c.caseNumber} - ${c.description}`;
                        casesList.appendChild(li);
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching cases:', error);
            });
    }

    // Call fetchCases on page load
    fetchCases();
});
