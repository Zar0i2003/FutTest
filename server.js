const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const readmeFile = path.join(__dirname, 'README.me');

function ensureDataFiles() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify({ users: [] }, null, 2), 'utf-8');
  }

  if (!fs.existsSync(readmeFile)) {
    fs.writeFileSync(
      readmeFile,
      '# FutTest\n\n## Данные супер-админа\n\nСупер-админ будет создан при первом запуске сервера.\n',
      'utf-8',
    );
  }
}

function readUsers() {
  const file = fs.readFileSync(usersFile, 'utf-8');
  return JSON.parse(file);
}

function writeUsers(payload) {
  fs.writeFileSync(usersFile, JSON.stringify(payload, null, 2), 'utf-8');
}

function upsertReadmeCredentials(login, password) {
  const markerStart = '<!-- SUPER_ADMIN_CREDENTIALS_START -->';
  const markerEnd = '<!-- SUPER_ADMIN_CREDENTIALS_END -->';
  const block = `${markerStart}\n- Логин: ${login}\n- Пароль: ${password}\n${markerEnd}`;

  const content = fs.readFileSync(readmeFile, 'utf-8');

  if (content.includes(markerStart) && content.includes(markerEnd)) {
    const updated = content.replace(new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`), block);
    fs.writeFileSync(readmeFile, updated, 'utf-8');
    return;
  }

  const updated = `${content.trim()}\n\n## Super Admin (создан при первом запуске)\n${block}\n`;
  fs.writeFileSync(readmeFile, updated, 'utf-8');
}

function bootstrapSuperAdmin() {
  const db = readUsers();
  const superAdmin = db.users.find((user) => user.role === 'super_admin');

  if (superAdmin) {
    return;
  }

  const login = `superadmin_${crypto.randomBytes(3).toString('hex')}`;
  const password = crypto.randomBytes(6).toString('base64url');
  const hash = bcrypt.hashSync(password, 10);

  db.users.push({
    id: crypto.randomUUID(),
    login,
    passwordHash: hash,
    role: 'super_admin',
    createdAt: new Date().toISOString(),
  });

  writeUsers(db);
  upsertReadmeCredentials(login, password);

  console.log('✅ Создан супер-админ при первом запуске:');
  console.log(`   Логин: ${login}`);
  console.log(`   Пароль: ${password}`);
  console.log('   Данные также записаны в README.me');
}

ensureDataFiles();
bootstrapSuperAdmin();

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 6,
    },
  }),
);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/session', (req, res) => {
  if (!req.session.user) {
    return res.json({ authenticated: false });
  }

  return res.json({
    authenticated: true,
    user: {
      login: req.session.user.login,
      role: req.session.user.role,
    },
  });
});

app.post('/api/login', (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ error: 'Введите логин и пароль.' });
  }

  const db = readUsers();
  const user = db.users.find((item) => item.login === login);

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Неверные учетные данные.' });
  }

  req.session.user = {
    id: user.id,
    login: user.login,
    role: user.role,
  };

  return res.json({
    success: true,
    user: {
      login: user.login,
      role: user.role,
    },
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

function requireSuperAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Доступ только для супер-админа.' });
  }
  return next();
}

app.get('/api/admin/data', requireSuperAdmin, (req, res) => {
  res.json({
    message: 'Добро пожаловать в защищенную админ-панель супер-админа.',
    stats: {
      users: readUsers().users.length,
      serverTime: new Date().toISOString(),
      securityLevel: 'maximum',
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
