let users = []; // Array to hold registered users

function toggleForms() {
    const loginForm = document.getElementById('login-form');
    const registrationForm = document.getElementById('registration-form');
    if (loginForm.style.display === "none") {
        loginForm.style.display = "block";
        registrationForm.style.display = "none";
    } else {
        loginForm.style.display = "none";
        registrationForm.style.display = "block";
    }
}

function handleLogin(event) {
    event.preventDefault(); // Prevent the form from submitting

    // Get username and password values
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Basic validation (you can enhance this)
    if (username === "" || password === "") {
        alert("Please fill in both fields.");
        return false;
    }

    // Check for registered user
    const user = users.find(user => (user.username === username || user.email === username) && user.password === password);
    if (user) {
        alert("Login successful! Welcome back, " + username + "!");
        // Redirect or perform further actions after successful login
    } else {
        alert("Invalid username or password. Please try again.");
    }
}

function handleRegistration(event) {
    event.preventDefault(); // Prevent the form from submitting

    // Get the date of birth value
    const dobInput = document.getElementById('dob').value;
    const dob = new Date(dobInput);
    const today = new Date();

    // Calculate age
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    // Set the age in the age input field
    document.getElementById('age').value = age;

    // Get password and confirm password values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Check if passwords match
    if (password !== confirmPassword) {
        alert("Passwords do not match. Please try again.");
        return false; // Prevent form submission
    }

    // Check if user already exists
    const userExists = users.some(user => user.username === username || user.email === email);
    if (userExists) {
        alert("User  already registered. Please log in.");
    } else {
        // Register the user
        users.push({ name, dob, age, email, phone, username, password });
        alert("Registration successful! You can now log in.");
        toggleForms(); // Switch to login form
    }
}