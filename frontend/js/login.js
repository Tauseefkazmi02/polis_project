document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.getElementById("toggle-icon");
  const loginForm = document.getElementById("login-form");

  document.querySelector('.password-toggle')?.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleIcon.className = 'fas fa-eye-slash';
    } else {
      passwordInput.type = 'password';
      toggleIcon.className = 'fas fa-eye';
    }
  });

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const usernameError = document.getElementById("username-error");
    const passwordError = document.getElementById("password-error");
    const successMessage = document.getElementById("success-message");
    const loginBtn = document.getElementById("login-btn");

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    usernameError.style.display = "none";
    passwordError.style.display = "none";
    successMessage.style.display = "none";
    usernameInput.style.borderColor = "#e1e5e9";
    passwordInput.style.borderColor = "#e1e5e9";

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

    let isValid = true;

    if (username.includes('@') && !emailPattern.test(username)) {
      usernameError.textContent = "Please enter a valid email address.";
      usernameError.style.display = "block";
      usernameInput.style.borderColor = "#dc3545";
      isValid = false;
    }

    if (!passwordPattern.test(password)) {
      passwordError.textContent = "Password must be at least 8 characters and include letters and numbers.";
      passwordError.style.display = "block";
      passwordInput.style.borderColor = "#dc3545";
      isValid = false;
    }

    if (!isValid) return;

    try {
      const originalText = loginBtn.innerHTML;
      loginBtn.innerHTML = '<div class="loading"></div> Signing In...';
      loginBtn.disabled = true;

      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        successMessage.style.display = "block";

        if (data.token) {
          localStorage.setItem('polis_token', data.token);
          localStorage.setItem('user_data', JSON.stringify(data.user));
        }

        setTimeout(() => {
          window.location.href = data.user?.role === 'admin'
            ? "admin-dashboard.html"
            : "dashboard.html";
        }, 2000);
      } else {
        if (data.error && data.error.includes('credentials')) {
          passwordError.textContent = "Invalid username or password.";
          passwordError.style.display = "block";
          passwordInput.style.borderColor = "#dc3545";
        } else {
          alert(data.error || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
      loginBtn.disabled = false;
    }
  });
});
