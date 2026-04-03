const API_BASE = 'http://localhost:5000/api';

const loginBtn       = document.getElementById('login-btn');
const loginError     = document.getElementById('login-error');
const fbLoginBtn     = document.getElementById('fb-login-btn');
const signupLink     = document.getElementById('signup-link');
const signupModal    = document.getElementById('signup-modal');
const closeModal     = document.getElementById('close-modal');
const closeModalLogin = document.getElementById('close-modal-login');
const registerBtn    = document.getElementById('register-btn');
const regError       = document.getElementById('reg-error');

// ── Login ──────────────────────────────────────────────────────────────────

loginBtn.addEventListener('click', async () => {
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  loginError.textContent = '';

  if (!email || !password) {
    loginError.textContent = 'Please fill in all fields.';
    return;
  }

  loginBtn.disabled    = true;
  loginBtn.textContent = 'Logging in…';

  try {
    const res  = await fetch(`${API_BASE}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      loginError.textContent = data.error || 'Login failed.';
      return;
    }

    localStorage.setItem('token',    data.token);
    localStorage.setItem('username', data.user.username);
    alert(`Welcome back, ${data.user.username}!`);
  } catch {
    loginError.textContent = 'Cannot reach server. Is the backend running?';
  } finally {
    loginBtn.disabled    = false;
    loginBtn.textContent = 'Log in';
  }
});

// ── Facebook login (simple redirect) ──────────────────────────────────────

fbLoginBtn.addEventListener('click', () => {
  window.open('https://www.facebook.com/login', '_blank');
});

// ── Signup modal ───────────────────────────────────────────────────────────

signupLink.addEventListener('click', (e) => {
  e.preventDefault();
  signupModal.style.display = 'flex';
});

[closeModal, closeModalLogin].forEach((el) =>
  el.addEventListener('click', (e) => {
    e.preventDefault();
    signupModal.style.display = 'none';
  })
);

signupModal.addEventListener('click', (e) => {
  if (e.target === signupModal) signupModal.style.display = 'none';
});

registerBtn.addEventListener('click', async () => {
  const username = document.getElementById('reg-username').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  regError.textContent = '';

  if (!username || !email || !password) {
    regError.textContent = 'All fields are required.';
    return;
  }

  registerBtn.disabled    = true;
  registerBtn.textContent = 'Signing up…';

  try {
    const res  = await fetch(`${API_BASE}/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      regError.textContent = data.error || 'Registration failed.';
      return;
    }

    localStorage.setItem('token',    data.token);
    localStorage.setItem('username', data.user.username);
    signupModal.style.display = 'none';
    alert(`Account created! Welcome, ${data.user.username}`);
  } catch {
    regError.textContent = 'Cannot reach server. Is the backend running?';
  } finally {
    registerBtn.disabled    = false;
    registerBtn.textContent = 'Sign up';
  }
});
