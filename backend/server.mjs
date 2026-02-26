import { createServer } from 'node:http';
import { randomBytes, pbkdf2Sync, timingSafeEqual, createHmac } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = resolve(__dirname, 'db.json');
const PORT = Number(process.env.PORT || 8080);
const TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || randomBytes(32).toString('hex');
const MASTER_ADMIN_EMAIL = (process.env.MASTER_ADMIN_EMAIL || 'admin@devotional.ai').toLowerCase();
const MASTER_ADMIN_PASSWORD = process.env.MASTER_ADMIN_PASSWORD || 'Devotional@2025&Home';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24;
const CHALLENGE_TTL_MS = 1000 * 60 * 10;
const IS_PROD = process.env.NODE_ENV === 'production';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

const DEFAULT_PUBLISHED_SEED = [
  {
    title: 'Morning Mercy',
    bibleVerse: 'Lamentations 3:22-23',
    devotionalMessage: 'The mercy of God is new this morning. Start today with gratitude, not guilt.',
    practicalApplication: 'Name three mercies you already received today.',
    callToAction: 'Begin your day with thanksgiving prayer.',
    imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1200&auto=format&fit=crop',
    format: 'Social Media Post',
    source: 'manual',
    publishedAtDelta: 7,
  },
  {
    title: 'Peace in the Storm',
    bibleVerse: 'Mark 4:39',
    devotionalMessage: 'Jesus still speaks peace over every storm and anxious thought.',
    practicalApplication: 'Pause and pray before reacting to pressure today.',
    callToAction: 'Trust God before outcomes.',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop',
    format: 'Video Script',
    source: 'manual',
    publishedAtDelta: 6,
  },
  {
    title: 'Still Waters Reflection',
    bibleVerse: 'Psalm 23:2',
    devotionalMessage: 'God leads your soul into stillness, not noise.',
    practicalApplication: 'Take five quiet minutes with this verse.',
    callToAction: 'Choose stillness over hurry.',
    imageUrl: 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?q=80&w=1200&auto=format&fit=crop',
    format: 'Image Concept',
    source: 'manual',
    publishedAtDelta: 5,
  },
  {
    title: 'Strength Text',
    bibleVerse: 'Philippians 4:13',
    devotionalMessage: 'You are not alone today. Grace is enough for this assignment.',
    practicalApplication: 'Send this encouragement to one friend.',
    callToAction: 'Speak life with your words.',
    format: 'SMS Message',
    source: 'manual',
    publishedAtDelta: 4,
  },
  {
    title: 'A Short Word on Prayer',
    bibleVerse: '1 Thessalonians 5:17',
    devotionalMessage: 'Prayer is the first response, not the last resort. Daily surrender forms lasting faith.',
    practicalApplication: 'Pray once before each major task today.',
    callToAction: 'Build a rhythm of first-response prayer.',
    format: 'Mini-Sermon',
    source: 'manual',
    publishedAtDelta: 3,
  },
  {
    title: 'Built on the Rock',
    bibleVerse: 'Matthew 7:24-25',
    devotionalMessage: 'A durable life is built through repeated obedience. Storms reveal foundations, and faithful habits form spiritual resilience over time.',
    practicalApplication: 'Create a weekly schedule for scripture and prayer.',
    callToAction: 'Build your life on Christ with consistent obedience.',
    format: 'Full-Length Sermon',
    source: 'manual',
    imageUrl: 'https://images.unsplash.com/photo-1508020963102-c6c723be5764?q=80&w=1200&auto=format&fit=crop',
    publishedAtDelta: 2,
  },
];

const now = () => Date.now();
const normalizeEmail = (email = '') => String(email).trim().toLowerCase();
const newId = (len = 9) => randomBytes(len).toString('hex').slice(0, len);

const ensureDb = () => {
  if (!existsSync(DB_PATH)) {
    const seed = {
      users: [],
      sessions: [],
      challenges: [],
      blacklist: [],
      auditLogs: [],
      resetRequests: [],
      loginRate: {},
      saved: [],
      calendar: [],
      pipeline: [],
      published: [],
    };
    writeFileSync(DB_PATH, JSON.stringify(seed, null, 2), 'utf8');
  }
};

const loadDb = () => {
  ensureDb();
  return JSON.parse(readFileSync(DB_PATH, 'utf8'));
};

const saveDb = (db) => {
  ensureDb();
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
};

const hashPassword = (password, salt = randomBytes(16).toString('hex')) => {
  const hash = pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, encoded) => {
  const [salt, expectedHex] = String(encoded || '').split(':');
  if (!salt || !expectedHex) return false;
  const actualHex = pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  const expected = Buffer.from(expectedHex, 'hex');
  const actual = Buffer.from(actualHex, 'hex');
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
};

const signToken = (payload) => {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', TOKEN_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
};

const verifyToken = (token) => {
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig) return null;
  const expectedSig = createHmac('sha256', TOKEN_SECRET).update(body).digest('base64url');
  const sigA = Buffer.from(sig);
  const sigB = Buffer.from(expectedSig);
  if (sigA.length !== sigB.length || !timingSafeEqual(sigA, sigB)) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
};

const toPublicUser = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  is2FAEnabled: user.is2FAEnabled,
  acceptedTermsAt: user.acceptedTermsAt,
  createdAt: user.createdAt,
});

const parseJsonBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) reject(new Error('Body too large'));
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });

const send = (res, status, body) => {
  res.writeHead(status, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
};

const getAuthToken = (req) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = String(header).split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
};

const ensureMasterAdmin = (db) => {
  const idx = db.users.findIndex((u) => u.email === MASTER_ADMIN_EMAIL);
  const passwordHash = hashPassword(MASTER_ADMIN_PASSWORD);
  if (idx === -1) {
    db.users.push({
      id: 'master-root-001',
      email: MASTER_ADMIN_EMAIL,
      passwordHash,
      role: 'admin',
      isVerified: true,
      is2FAEnabled: true,
      acceptedTermsAt: now(),
      createdAt: now(),
    });
  } else {
    db.users[idx].role = 'admin';
    db.users[idx].isVerified = true;
    db.users[idx].is2FAEnabled = true;
  }
};

const ensureDbShape = (db) => {
  if (!Array.isArray(db.auditLogs)) db.auditLogs = [];
};

const ensureContentSeed = (db) => {
  if (db.published.length > 0) return;
  const base = now();
  db.published = DEFAULT_PUBLISHED_SEED.map((item, idx) => ({
    ...item,
    id: `seed-${idx + 1}`,
    ownerId: 'master-root-001',
    publishedAt: base - 1000 * 60 * 60 * 24 * item.publishedAtDelta,
  }));
};

const appendAuditLog = (db, actor, action, details = {}) => {
  const entry = {
    id: newId(16),
    at: now(),
    actorId: actor?.id || 'system',
    actorEmail: actor?.email || 'system',
    action,
    ...details,
  };
  db.auditLogs.unshift(entry);
  if (db.auditLogs.length > 2000) {
    db.auditLogs = db.auditLogs.slice(0, 2000);
  }
};

const cleanup = (db) => {
  const current = now();
  db.sessions = db.sessions.filter((s) => s.expiresAt > current);
  db.challenges = db.challenges.filter((c) => c.expiresAt > current);
};

const rateLimited = (db, key, limit = 20, windowMs = 1000 * 60 * 5) => {
  const current = now();
  const bucket = db.loginRate[key] || [];
  const recent = bucket.filter((ts) => current - ts < windowMs);
  recent.push(current);
  db.loginRate[key] = recent;
  return recent.length > limit;
};

const getSessionAndUser = (req, db) => {
  const token = getAuthToken(req);
  if (!token) return { ok: false, reason: 'Missing token' };

  const payload = verifyToken(token);
  if (!payload || !payload.sid) return { ok: false, reason: 'Invalid token' };

  const session = db.sessions.find((s) => s.id === payload.sid && s.token === token && s.expiresAt > now());
  if (!session) return { ok: false, reason: 'Session expired' };

  const user = db.users.find((u) => u.id === session.userId);
  if (!user) return { ok: false, reason: 'User not found' };

  return { ok: true, session, user, token };
};

const isAdmin = (user) => user?.role === 'admin';

const scopedList = (records, user, allowAll = false, searchParams) => {
  const scope = searchParams?.get('scope');
  if (allowAll && isAdmin(user) && scope === 'all') return records;
  return records.filter((r) => r.ownerId === user.id);
};

const requireAdmin = (auth, res, db) => {
  if (!auth.ok) {
    saveDb(db);
    send(res, 401, { success: false, message: auth.reason });
    return false;
  }
  if (!isAdmin(auth.user)) {
    saveDb(db);
    send(res, 403, { success: false, message: 'Forbidden' });
    return false;
  }
  return true;
};

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const path = url.pathname;

  const db = loadDb();
  ensureDbShape(db);
  ensureMasterAdmin(db);
  ensureContentSeed(db);
  cleanup(db);

  try {
    if (req.method === 'GET' && path === '/api/health') {
      saveDb(db);
      return send(res, 200, { ok: true, status: 'up' });
    }

    if (req.method === 'POST' && path === '/api/auth/signup') {
      const body = await parseJsonBody(req);
      const email = normalizeEmail(body.email);
      const password = String(body.password || '');

      if (!email || !password) return send(res, 400, { success: false, message: 'Email and password are required.' });
      if (password.length < 8) return send(res, 400, { success: false, message: 'Password must be at least 8 characters.' });
      if (db.blacklist.includes(email)) return send(res, 403, { success: false, message: 'This identity has been blacklisted.' });
      if (db.users.some((u) => u.email === email)) return send(res, 409, { success: false, message: 'An account with this email already exists.' });

      db.users.push({
        id: newId(16),
        email,
        passwordHash: hashPassword(password),
        role: 'user',
        isVerified: false,
        is2FAEnabled: true,
        acceptedTermsAt: now(),
        createdAt: now(),
      });

      saveDb(db);
      return send(res, 201, { success: true, message: 'Account created. Verify email to continue.' });
    }

    if (req.method === 'POST' && path === '/api/auth/verify-email') {
      const body = await parseJsonBody(req);
      const email = normalizeEmail(body.email);
      const user = db.users.find((u) => u.email === email);
      if (!user) return send(res, 404, { success: false, message: 'User not found.' });
      user.isVerified = true;
      saveDb(db);
      return send(res, 200, { success: true });
    }

    if (req.method === 'POST' && path === '/api/auth/signin') {
      const body = await parseJsonBody(req);
      const email = normalizeEmail(body.email);
      const password = String(body.password || '');
      const ipKey = `${email}:${req.socket.remoteAddress || 'unknown'}`;

      if (rateLimited(db, ipKey)) {
        saveDb(db);
        return send(res, 429, { success: false, message: 'Too many attempts. Please wait and try again.' });
      }
      if (db.blacklist.includes(email)) {
        saveDb(db);
        return send(res, 403, { success: false, message: 'This identity is blacklisted.' });
      }

      const user = db.users.find((u) => u.email === email);
      if (!user || !verifyPassword(password, user.passwordHash)) {
        saveDb(db);
        return send(res, 401, { success: false, message: 'Invalid email or password.' });
      }
      if (!user.isVerified) {
        saveDb(db);
        return send(res, 403, { success: false, message: 'Please verify your email address.' });
      }

      if (user.is2FAEnabled) {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        const challengeId = newId(20);
        db.challenges.push({ id: challengeId, userId: user.id, code, expiresAt: now() + CHALLENGE_TTL_MS });
        console.log(`[2FA] Login code for ${email}: ${code}`);
        saveDb(db);
        return send(res, 200, {
          success: true,
          requires2FA: true,
          challengeId,
          ...(IS_PROD ? {} : { devCode: code }),
        });
      }

      const sid = newId(24);
      const expiresAt = now() + SESSION_TTL_MS;
      const token = signToken({ sid, uid: user.id, exp: expiresAt });
      db.sessions.push({ id: sid, userId: user.id, token, expiresAt });
      saveDb(db);
      return send(res, 200, { success: true, session: { user: toPublicUser(user), token, expiresAt } });
    }

    if (req.method === 'POST' && path === '/api/auth/verify-2fa') {
      const body = await parseJsonBody(req);
      const challengeId = String(body.challengeId || '');
      const code = String(body.code || '');
      const challenge = db.challenges.find((c) => c.id === challengeId && c.expiresAt > now());
      if (!challenge) {
        saveDb(db);
        return send(res, 401, { success: false, message: 'Session expired.' });
      }
      if (challenge.code !== code) {
        saveDb(db);
        return send(res, 401, { success: false, message: 'Invalid code.' });
      }

      const user = db.users.find((u) => u.id === challenge.userId);
      if (!user) {
        db.challenges = db.challenges.filter((c) => c.id !== challenge.id);
        saveDb(db);
        return send(res, 404, { success: false, message: 'User not found.' });
      }

      db.challenges = db.challenges.filter((c) => c.id !== challenge.id);
      const sid = newId(24);
      const expiresAt = now() + SESSION_TTL_MS;
      const token = signToken({ sid, uid: user.id, exp: expiresAt });
      db.sessions.push({ id: sid, userId: user.id, token, expiresAt });
      saveDb(db);

      return send(res, 200, { success: true, session: { user: toPublicUser(user), token, expiresAt } });
    }

    if (req.method === 'POST' && path === '/api/auth/resend-2fa') {
      const body = await parseJsonBody(req);
      const challengeId = String(body.challengeId || '');
      const challenge = db.challenges.find((c) => c.id === challengeId && c.expiresAt > now());
      if (!challenge) {
        saveDb(db);
        return send(res, 401, { success: false, message: 'Session expired.' });
      }
      const user = db.users.find((u) => u.id === challenge.userId);
      if (!user) {
        saveDb(db);
        return send(res, 404, { success: false, message: 'User not found.' });
      }

      challenge.code = String(Math.floor(100000 + Math.random() * 900000));
      challenge.expiresAt = now() + CHALLENGE_TTL_MS;
      console.log(`[2FA] Resent login code for ${user.email}: ${challenge.code}`);
      saveDb(db);
      return send(res, 200, { success: true, ...(IS_PROD ? {} : { devCode: challenge.code }) });
    }

    if (req.method === 'GET' && path === '/api/auth/session') {
      const auth = getSessionAndUser(req, db);
      if (!auth.ok) {
        saveDb(db);
        return send(res, 401, { success: false, message: auth.reason });
      }
      saveDb(db);
      return send(res, 200, {
        success: true,
        session: {
          user: toPublicUser(auth.user),
          token: auth.token,
          expiresAt: auth.session.expiresAt,
        },
      });
    }

    if (req.method === 'POST' && path === '/api/auth/logout') {
      const auth = getSessionAndUser(req, db);
      if (auth.ok) db.sessions = db.sessions.filter((s) => s.id !== auth.session.id);
      saveDb(db);
      return send(res, 200, { success: true });
    }

    if (req.method === 'POST' && path === '/api/auth/reset-password') {
      const body = await parseJsonBody(req);
      const email = normalizeEmail(body.email);
      db.resetRequests.push({ id: newId(16), email, createdAt: now() });
      console.log(`[RESET] Password reset requested for ${email}`);
      saveDb(db);
      return send(res, 200, { success: true });
    }

    if (req.method === 'GET' && path === '/api/data/snapshot') {
      const auth = getSessionAndUser(req, db);
      if (!auth.ok) {
        saveDb(db);
        return send(res, 401, { success: false, message: auth.reason });
      }
      const saved = scopedList(db.saved, auth.user, true, url.searchParams).map((item) => item.content);
      const calendar = scopedList(db.calendar, auth.user, true, url.searchParams).map((item) => item.entry);
      const pipeline = scopedList(db.pipeline, auth.user, true, url.searchParams).map((item) => item.item);
      const published = [...db.published].sort((a, b) => b.publishedAt - a.publishedAt).map(({ ownerId, ...item }) => item);
      saveDb(db);
      return send(res, 200, { success: true, saved, calendar, pipeline, published });
    }

    if (req.method === 'GET' && path === '/api/data/saved') {
      const auth = getSessionAndUser(req, db);
      if (!auth.ok) {
        saveDb(db);
        return send(res, 401, { success: false, message: auth.reason });
      }
      const saved = scopedList(db.saved, auth.user, true, url.searchParams).map((item) => item.content);
      saveDb(db);
      return send(res, 200, { success: true, saved });
    }

    if (req.method === 'POST' && path === '/api/data/saved') {
      const auth = getSessionAndUser(req, db);
      if (!auth.ok) {
        saveDb(db);
        return send(res, 401, { success: false, message: auth.reason });
      }
      const body = await parseJsonBody(req);
      const content = body.content;
      if (!content?.title) {
        saveDb(db);
        return send(res, 400, { success: false, message: 'Content payload is required.' });
      }

      const idx = db.saved.findIndex((s) => s.ownerId === auth.user.id && s.content.title === content.title);
      const record = { id: newId(16), ownerId: auth.user.id, createdAt: now(), content };
      if (idx >= 0) db.saved[idx] = record;
      else db.saved.unshift(record);

      const saved = db.saved.filter((s) => s.ownerId === auth.user.id).map((s) => s.content);
      saveDb(db);
      return send(res, 200, { success: true, saved });
    }

    if (req.method === 'DELETE' && path.startsWith('/api/data/saved/')) {
      const auth = getSessionAndUser(req, db);
      if (!auth.ok) {
        saveDb(db);
        return send(res, 401, { success: false, message: auth.reason });
      }
      const id = path.split('/').pop();
      db.saved = db.saved.filter((s) => !(s.id === id && s.ownerId === auth.user.id));
      const saved = db.saved.filter((s) => s.ownerId === auth.user.id).map((s) => s.content);
      saveDb(db);
      return send(res, 200, { success: true, saved });
    }

    if (req.method === 'GET' && path === '/api/data/calendar') {
      const auth = getSessionAndUser(req, db);
      if (!auth.ok) {
        saveDb(db);
        return send(res, 401, { success: false, message: auth.reason });
      }
      const calendar = scopedList(db.calendar, auth.user, true, url.searchParams).map((item) => item.entry);
      saveDb(db);
      return send(res, 200, { success: true, calendar });
    }

    if (req.method === 'POST' && path === '/api/data/calendar') {
      const auth = getSessionAndUser(req, db);
      if (!auth.ok) {
        saveDb(db);
        return send(res, 401, { success: false, message: auth.reason });
      }
      const body = await parseJsonBody(req);
      const entry = body.entry;
      if (!entry?.id || !entry?.date) {
        saveDb(db);
        return send(res, 400, { success: false, message: 'Calendar entry is invalid.' });
      }
      db.calendar = db.calendar.filter((c) => !(c.ownerId === auth.user.id && c.entry.id === entry.id));
      db.calendar.push({ ownerId: auth.user.id, entry, createdAt: now() });
      const calendar = db.calendar.filter((c) => c.ownerId === auth.user.id).map((c) => c.entry);
      saveDb(db);
      return send(res, 200, { success: true, calendar });
    }

    if (req.method === 'DELETE' && path.startsWith('/api/data/calendar/')) {
      const auth = getSessionAndUser(req, db);
      if (!auth.ok) {
        saveDb(db);
        return send(res, 401, { success: false, message: auth.reason });
      }
      const id = path.split('/').pop();
      db.calendar = db.calendar.filter((c) => {
        if (c.entry.id !== id) return true;
        if (isAdmin(auth.user)) return false;
        return c.ownerId !== auth.user.id;
      });
      const calendar = scopedList(db.calendar, auth.user, true, url.searchParams).map((c) => c.entry);
      saveDb(db);
      return send(res, 200, { success: true, calendar });
    }

    if (req.method === 'GET' && path === '/api/data/pipeline') {
      const auth = getSessionAndUser(req, db);
      if (!auth.ok) {
        saveDb(db);
        return send(res, 401, { success: false, message: auth.reason });
      }
      const pipeline = scopedList(db.pipeline, auth.user, true, url.searchParams).map((item) => item.item);
      saveDb(db);
      return send(res, 200, { success: true, pipeline });
    }

    if (req.method === 'POST' && path === '/api/data/pipeline') {
      const auth = getSessionAndUser(req, db);
      if (!auth.ok) {
        saveDb(db);
        return send(res, 401, { success: false, message: auth.reason });
      }
      const body = await parseJsonBody(req);
      const item = body.item;
      if (!item?.id || !item?.content) {
        saveDb(db);
        return send(res, 400, { success: false, message: 'Pipeline item is invalid.' });
      }
      db.pipeline = db.pipeline.filter((p) => !(p.ownerId === auth.user.id && p.item.id === item.id));
      db.pipeline.push({ ownerId: auth.user.id, item, createdAt: now() });
      const pipeline = db.pipeline.filter((p) => p.ownerId === auth.user.id).map((p) => p.item);
      saveDb(db);
      return send(res, 200, { success: true, pipeline });
    }

    if (req.method === 'PUT' && path.startsWith('/api/data/pipeline/')) {
      const auth = getSessionAndUser(req, db);
      if (!auth.ok) {
        saveDb(db);
        return send(res, 401, { success: false, message: auth.reason });
      }
      const id = path.split('/').pop();
      const body = await parseJsonBody(req);
      const item = body.item;
      if (!item?.id || item.id !== id) {
        saveDb(db);
        return send(res, 400, { success: false, message: 'Pipeline item ID mismatch.' });
      }
      const idx = db.pipeline.findIndex((p) => {
        if (p.item.id !== id) return false;
        return isAdmin(auth.user) || p.ownerId === auth.user.id;
      });
      if (idx === -1) {
        saveDb(db);
        return send(res, 404, { success: false, message: 'Pipeline item not found.' });
      }
      db.pipeline[idx].item = item;
      const pipeline = scopedList(db.pipeline, auth.user, true, url.searchParams).map((p) => p.item);
      saveDb(db);
      return send(res, 200, { success: true, pipeline });
    }

    if (req.method === 'DELETE' && path.startsWith('/api/data/pipeline/')) {
      const auth = getSessionAndUser(req, db);
      if (!auth.ok) {
        saveDb(db);
        return send(res, 401, { success: false, message: auth.reason });
      }
      const id = path.split('/').pop();
      db.pipeline = db.pipeline.filter((p) => {
        if (p.item.id !== id) return true;
        if (isAdmin(auth.user)) return false;
        return p.ownerId !== auth.user.id;
      });
      const pipeline = scopedList(db.pipeline, auth.user, true, url.searchParams).map((p) => p.item);
      saveDb(db);
      return send(res, 200, { success: true, pipeline });
    }

    if (req.method === 'GET' && path === '/api/data/published') {
      const auth = getSessionAndUser(req, db);
      if (!auth.ok) {
        saveDb(db);
        return send(res, 401, { success: false, message: auth.reason });
      }
      const published = [...db.published].sort((a, b) => b.publishedAt - a.publishedAt).map(({ ownerId, ...item }) => item);
      saveDb(db);
      return send(res, 200, { success: true, published });
    }

    if (req.method === 'POST' && path === '/api/data/published') {
      const auth = getSessionAndUser(req, db);
      if (!requireAdmin(auth, res, db)) return;

      const body = await parseJsonBody(req);
      const content = body.content;
      if (!content?.title) {
        saveDb(db);
        return send(res, 400, { success: false, message: 'Published content is invalid.' });
      }
      const created = { ...content, id: newId(11), ownerId: auth.user.id, publishedAt: now() };
      db.published.unshift(created);
      appendAuditLog(db, auth.user, 'published_created', {
        entityType: 'published',
        entityId: created.id,
        target: created.title || created.bibleVerse || 'Untitled',
        source: created.source || 'manual',
      });
      const published = [...db.published].sort((a, b) => b.publishedAt - a.publishedAt).map(({ ownerId, ...item }) => item);
      saveDb(db);
      return send(res, 200, { success: true, published });
    }

    if (req.method === 'DELETE' && path.startsWith('/api/data/published/')) {
      const auth = getSessionAndUser(req, db);
      if (!requireAdmin(auth, res, db)) return;
      const id = path.split('/').pop();
      const existing = db.published.find((p) => p.id === id);
      db.published = db.published.filter((p) => p.id !== id);
      if (existing) {
        appendAuditLog(db, auth.user, 'published_deleted', {
          entityType: 'published',
          entityId: existing.id,
          target: existing.title || existing.bibleVerse || 'Untitled',
          source: existing.source || 'manual',
        });
      }
      const published = [...db.published].sort((a, b) => b.publishedAt - a.publishedAt).map(({ ownerId, ...item }) => item);
      saveDb(db);
      return send(res, 200, { success: true, published });
    }

    if (req.method === 'GET' && path === '/api/admin/users') {
      const auth = getSessionAndUser(req, db);
      if (!requireAdmin(auth, res, db)) return;
      saveDb(db);
      return send(res, 200, { success: true, users: db.users.map(toPublicUser) });
    }

    if (req.method === 'PUT' && path.startsWith('/api/admin/users/') && path.endsWith('/role')) {
      const auth = getSessionAndUser(req, db);
      if (!requireAdmin(auth, res, db)) return;
      const parts = path.split('/');
      const userId = parts[4];
      const body = await parseJsonBody(req);
      const role = String(body.role || '');
      if (!['user', 'admin'].includes(role)) {
        saveDb(db);
        return send(res, 400, { success: false, message: 'Invalid role.' });
      }
      const user = db.users.find((u) => u.id === userId);
      if (!user) {
        saveDb(db);
        return send(res, 404, { success: false, message: 'User not found.' });
      }
      if (user.email === MASTER_ADMIN_EMAIL && role !== 'admin') {
        saveDb(db);
        return send(res, 400, { success: false, message: 'Cannot demote master admin.' });
      }
      const previousRole = user.role;
      user.role = role;
      appendAuditLog(db, auth.user, 'role_changed', {
        entityType: 'user',
        entityId: user.id,
        target: user.email,
        previousRole,
        newRole: role,
      });
      saveDb(db);
      return send(res, 200, { success: true, users: db.users.map(toPublicUser) });
    }

    if (req.method === 'GET' && path === '/api/admin/blacklist') {
      const auth = getSessionAndUser(req, db);
      if (!requireAdmin(auth, res, db)) return;
      saveDb(db);
      return send(res, 200, { success: true, blacklist: db.blacklist });
    }

    if (req.method === 'POST' && path === '/api/admin/blacklist/add') {
      const auth = getSessionAndUser(req, db);
      if (!requireAdmin(auth, res, db)) return;

      const body = await parseJsonBody(req);
      const email = normalizeEmail(body.email);
      if (!email) {
        saveDb(db);
        return send(res, 400, { success: false, message: 'Email required.' });
      }

      if (!db.blacklist.includes(email)) db.blacklist.push(email);
      const removedUsers = db.users.filter((u) => u.email === email && u.email !== MASTER_ADMIN_EMAIL).map((u) => u.id);
      db.users = db.users.filter((u) => u.email !== email || u.email === MASTER_ADMIN_EMAIL);
      db.sessions = db.sessions.filter((s) => !removedUsers.includes(s.userId));
      db.saved = db.saved.filter((s) => !removedUsers.includes(s.ownerId));
      db.calendar = db.calendar.filter((c) => !removedUsers.includes(c.ownerId));
      db.pipeline = db.pipeline.filter((p) => !removedUsers.includes(p.ownerId));
      appendAuditLog(db, auth.user, 'blacklist_added', {
        entityType: 'blacklist',
        target: email,
      });

      saveDb(db);
      return send(res, 200, { success: true, blacklist: db.blacklist });
    }

    if (req.method === 'POST' && path === '/api/admin/blacklist/remove') {
      const auth = getSessionAndUser(req, db);
      if (!requireAdmin(auth, res, db)) return;
      const body = await parseJsonBody(req);
      const email = normalizeEmail(body.email);
      db.blacklist = db.blacklist.filter((e) => e !== email);
      appendAuditLog(db, auth.user, 'blacklist_removed', {
        entityType: 'blacklist',
        target: email,
      });
      saveDb(db);
      return send(res, 200, { success: true, blacklist: db.blacklist });
    }

    if (req.method === 'GET' && path === '/api/admin/audit') {
      const auth = getSessionAndUser(req, db);
      if (!requireAdmin(auth, res, db)) return;
      const limit = Math.min(500, Math.max(20, Number(url.searchParams.get('limit') || 200)));
      const logs = db.auditLogs.slice(0, limit);
      saveDb(db);
      return send(res, 200, { success: true, logs });
    }

    if (req.method === 'GET' && path === '/api/admin/data/raw') {
      const auth = getSessionAndUser(req, db);
      if (!requireAdmin(auth, res, db)) return;
      const keys = ['users', 'saved', 'calendar', 'pipeline', 'published', 'blacklist'];
      const raw = keys.map((key) => ({ key: `devotional_api_${key}`, value: JSON.stringify(db[key] || [], null, 2) }));
      saveDb(db);
      return send(res, 200, { success: true, raw });
    }

    if (req.method === 'PUT' && path === '/api/admin/data/raw') {
      const auth = getSessionAndUser(req, db);
      if (!requireAdmin(auth, res, db)) return;
      const body = await parseJsonBody(req);
      const key = String(body.key || '');
      const value = String(body.value || '');
      const keyMap = {
        devotional_api_users: 'users',
        devotional_api_saved: 'saved',
        devotional_api_calendar: 'calendar',
        devotional_api_pipeline: 'pipeline',
        devotional_api_published: 'published',
        devotional_api_blacklist: 'blacklist',
      };
      const dbKey = keyMap[key];
      if (!dbKey) {
        saveDb(db);
        return send(res, 400, { success: false, message: 'Unsupported key.' });
      }
      try {
        db[dbKey] = JSON.parse(value);
      } catch {
        saveDb(db);
        return send(res, 400, { success: false, message: 'Invalid JSON.' });
      }
      ensureMasterAdmin(db);
      saveDb(db);
      return send(res, 200, { success: true });
    }

    saveDb(db);
    return send(res, 404, { success: false, message: 'Not found' });
  } catch (error) {
    console.error('[API_ERROR]', error);
    saveDb(db);
    return send(res, 500, { success: false, message: 'Server error' });
  }
});

server.listen(PORT, () => {
  console.log(`[backend] listening on http://localhost:${PORT}`);
  if (!process.env.AUTH_TOKEN_SECRET) {
    console.log('[backend] AUTH_TOKEN_SECRET not set. Temporary secret generated for this process.');
  }
  if (!process.env.MASTER_ADMIN_PASSWORD) {
    console.log('[backend] MASTER_ADMIN_PASSWORD not set. Using default development password.');
  }
});
