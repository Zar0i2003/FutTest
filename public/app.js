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
  gsap.fromTo(authPanel, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' });
}

function showAdminPanel() {
  adminPanel.classList.remove('hidden');
  gsap.fromTo(adminPanel, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' });
}

function hideAdminPanel() {
  adminPanel.classList.add('hidden');
}

function setMessage(text, good = false) {
  authMessage.textContent = text;
  authMessage.style.color = good ? '#98f4d2' : '#ffb3cc';
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

function animateMetrics() {
  gsap.utils.toArray('.metric span').forEach((line) => {
    const finalWidth = line.closest('.card').dataset.rate;
    gsap.to(line, {
      width: finalWidth,
      duration: 1.3,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: line,
        start: 'top 86%',
      },
    });
  });
}

function initMotion() {
  gsap.registerPlugin(ScrollTrigger);

  gsap
    .timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero-top > *', { y: -10, opacity: 0, duration: 0.45, stagger: 0.08 })
    .from('.hero h1', { y: 22, opacity: 0, duration: 0.8 }, '-=0.2')
    .from('.hero p', { y: 12, opacity: 0, duration: 0.55 }, '-=0.35')
    .from('.hero-actions > *', { y: 10, opacity: 0, duration: 0.45, stagger: 0.1 }, '-=0.3')
    .from('.reveal-delay .card', { y: 34, opacity: 0, duration: 0.7, stagger: 0.14 }, '-=0.35');

  gsap.to('.float-card', {
    y: -8,
    duration: 2.1,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
    stagger: 0.18,
  });

  gsap.to('.orb-1', { x: 24, y: 20, duration: 5.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  gsap.to('.orb-2', { x: -20, y: -14, duration: 5.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  gsap.to('.bg-grid', { backgroundPosition: '38px 24px', duration: 11, repeat: -1, ease: 'none' });

  gsap.utils.toArray('.card').forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const bounds = card.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -8;
      gsap.to(card, { rotateX: y, rotateY: x, transformPerspective: 900, duration: 0.3 });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.35, ease: 'power2.out' });
    });
  });

  animateMetrics();
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
    gsap.fromTo(loginForm, { x: -5 }, { x: 5, duration: 0.08, repeat: 5, yoyo: true });
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
  initMotion();
  await checkSession();
});
