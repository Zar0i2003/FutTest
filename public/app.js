const openLoginBtn = document.getElementById('openLogin');
const authPanel = document.getElementById('authPanel');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const authMessage = document.getElementById('authMessage');
const sessionInfo = document.getElementById('sessionInfo');
const adminText = document.getElementById('adminText');

function showAuthPanel() {
  authPanel.classList.remove('hidden');
  gsap.fromTo(authPanel, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
}

function showAdminPanel() {
  adminPanel.classList.remove('hidden');
  gsap.fromTo(adminPanel, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
}

function hideAdminPanel() {
  adminPanel.classList.add('hidden');
}

function setMessage(text, good = false) {
  authMessage.textContent = text;
  authMessage.style.color = good ? '#93f2cf' : '#ffc2d2';
}

async function checkSession() {
  const res = await fetch('/api/session');
  const data = await res.json();

  if (!data.authenticated) {
    sessionInfo.textContent = 'Гость';
    hideAdminPanel();
    return;
  }

  sessionInfo.textContent = `${data.user.login} · ${data.user.role}`;

  if (data.user.role === 'super_admin') {
    await loadAdminData();
  } else {
    hideAdminPanel();
  }
}

async function loadAdminData() {
  const res = await fetch('/api/admin/data');
  const data = await res.json();

  if (!res.ok) {
    hideAdminPanel();
    return;
  }

  adminText.textContent = `${data.message} Пользователей: ${data.stats.users}. Время сервера: ${new Date(
    data.stats.serverTime,
  ).toLocaleString()}.`;
  showAdminPanel();
}

openLoginBtn.addEventListener('click', showAuthPanel);

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const login = document.getElementById('login').value.trim();
  const password = document.getElementById('password').value;

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    setMessage(data.error || 'Ошибка входа');
    gsap.fromTo(loginForm, { x: -6 }, { x: 6, duration: 0.08, yoyo: true, repeat: 5 });
    return;
  }

  setMessage(`Успешный вход: ${data.user.login}`, true);
  await checkSession();
});

logoutBtn.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  setMessage('Вы вышли из системы.', true);
  await checkSession();
});

window.addEventListener('DOMContentLoaded', async () => {
  const tl = gsap.timeline();
  tl.from('.hero', { y: 26, opacity: 0, duration: 0.8, ease: 'power3.out' })
    .from('.reveal-delay .card', { y: 24, opacity: 0, duration: 0.65, stagger: 0.15, ease: 'power3.out' }, '-=0.4')
    .from('.orb-1', { scale: 0.6, opacity: 0, duration: 1.1, ease: 'sine.out' }, '-=1.0')
    .from('.orb-2', { scale: 0.6, opacity: 0, duration: 1.1, ease: 'sine.out' }, '-=1.0');

  gsap.to('.float-card', {
    y: -7,
    duration: 2.2,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
    stagger: 0.2,
  });

  gsap.to('.orb-1', { x: 20, y: 18, duration: 6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  gsap.to('.orb-2', { x: -18, y: -12, duration: 5.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });

  await checkSession();
});
