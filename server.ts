import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DESIGNS_FILE = path.join(DATA_DIR, 'designs.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const OWNER_USER = 'dilanmax2';
const OWNER_PASS = 'sasindumax';
const DEFAULT_FIVERR_URL = 'https://www.fiverr.com/s/bk0w0Xq';

const TOKEN_SECRET =
  process.env.STUDIO_SESSION_SECRET ||
  crypto.createHash('sha256').update(`${OWNER_USER}:${OWNER_PASS}:dilanmax-mylar-studio-v3`).digest('hex');

interface StoredDesign {
  id: string;
  title: string;
  category: '3.5g Stand-Up' | 'Die-Cut Shape' | 'Holographic Foil' | 'Matte & Spot UV';
  finish: string;
  dimensions: string;
  description: string;
  imageUrl: string;
  fiverrUrl: string;
  createdAt: string;
  isPreset?: boolean;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  salt: string;
  passwordHash: string;
  savedDesignIds: string[];
  createdAt: string;
}

interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  exp: number;
}

const SEED_DESIGNS: StoredDesign[] = [
  {
    id: 'mylar-berry-fusion',
    title: 'Aroma Botanica — Berry Fusion',
    category: 'Holographic Foil',
    finish: 'Matte Soft-Touch + Iridescent Foil',
    dimensions: '4.0" × 5.2" · 3.5g Stand-Up',
    description:
      'Deep indigo matte pouch engineered with rainbow holographic botanical linework, tear-notch header, and euro-slot retail hanger.',
    imageUrl: 'preset:cosmic-berry',
    fiverrUrl: DEFAULT_FIVERR_URL,
    createdAt: '2026-10-18T09:00:00.000Z',
    isPreset: true,
  },
  {
    id: 'mylar-emerald-prism',
    title: 'Emerald Prism — Custom Die-Cut',
    category: 'Die-Cut Shape',
    finish: 'Custom Contour Die-Cut + Prism Foil',
    dimensions: '4.7" × 6.0" · Custom Silhouette',
    description:
      'Precision contour die-cut Mylar pouch featuring metallic prism highlights, front clear product window, and custom resealable track.',
    imageUrl: 'preset:diecut-emerald',
    fiverrUrl: DEFAULT_FIVERR_URL,
    createdAt: '2026-10-24T11:30:00.000Z',
    isPreset: true,
  },
  {
    id: 'mylar-volcanica-obsidian',
    title: 'Volcanica — Obsidian Gold Crest',
    category: 'Matte & Spot UV',
    finish: 'Obsidian Matte + Embossed Gold Foil',
    dimensions: '5.5" × 8.5" · Box-Bottom Pouch',
    description:
      'Architectural dark matte packaging featuring hot-stamped gold emblem work, clean typographic hierarchy, and heavy-barrier seal.',
    imageUrl: 'preset:obsidian-gold',
    fiverrUrl: DEFAULT_FIVERR_URL,
    createdAt: '2026-11-01T14:15:00.000Z',
    isPreset: true,
  },
  {
    id: 'mylar-citrus-squeeze',
    title: 'Citrus Squeeze — Brushed Chrome',
    category: '3.5g Stand-Up',
    finish: 'Brushed Metallic Film + Spot Gloss UV',
    dimensions: '5.0" × 7.5" · Stand-Up Zip',
    description:
      'High-visibility retail stand-up pouch pairing raw brushed aluminum substrate with vibrant citrus color blocking and spot UV contrast.',
    imageUrl: 'preset:chrome-lemon',
    fiverrUrl: DEFAULT_FIVERR_URL,
    createdAt: '2026-11-06T16:45:00.000Z',
    isPreset: true,
  },
];

function ensureStorageReady() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(DESIGNS_FILE)) {
    fs.writeFileSync(DESIGNS_FILE, JSON.stringify(SEED_DESIGNS, null, 2), 'utf-8');
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readDesigns(): StoredDesign[] {
  ensureStorageReady();
  try {
    const raw = fs.readFileSync(DESIGNS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_DESIGNS;
  } catch {
    return SEED_DESIGNS;
  }
}

function writeDesigns(designs: StoredDesign[]) {
  ensureStorageReady();
  fs.writeFileSync(DESIGNS_FILE, JSON.stringify(designs, null, 2), 'utf-8');
}

function readUsers(): StoredUser[] {
  ensureStorageReady();
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  ensureStorageReady();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const computed = crypto.scryptSync(password, salt, 64);
  const target = Buffer.from(storedHash, 'hex');
  if (computed.length !== target.length) return false;
  return crypto.timingSafeEqual(computed, target);
}

function signToken(user: Omit<TokenPayload, 'exp'>): string {
  const payload = Buffer.from(
    JSON.stringify({
      ...user,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 14,
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function decodeToken(token: string | undefined): TokenPayload | null {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as TokenPayload;
    if (typeof decoded.exp !== 'number' || decoded.exp <= Date.now()) return null;
    if (decoded.role !== 'admin' && decoded.role !== 'member') return null;
    return decoded;
  } catch {
    return null;
  }
}

function getBearerToken(req: express.Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return undefined;
  return authHeader.slice(7).trim();
}

function saveBase64Image(dataUri: string): string | null {
  const match = /^data:(image\/(?:png|jpeg|jpg|webp|gif));base64,([A-Za-z0-9+/=]+)$/i.exec(dataUri.trim());
  if (!match) return null;
  const mime = match[1].toLowerCase();
  const base64Data = match[2];
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : mime.includes('gif') ? 'gif' : 'jpg';
  const filename = `mylar_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
  const buffer = Buffer.from(base64Data, 'base64');
  if (buffer.length > 10 * 1024 * 1024) {
    throw new Error('Image exceeds 10MB limit.');
  }
  ensureStorageReady();
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

async function startServer() {
  ensureStorageReady();

  const app = express();
  app.use(express.json({ limit: '15mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body ?? {};
    const cleanName = typeof name === 'string' ? name.trim().slice(0, 60) : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const rawPassword = typeof password === 'string' ? password : '';

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ ok: false, error: 'Please enter your name (at least 2 characters).' });
    }
    if (!cleanEmail || cleanEmail.length < 3 || cleanEmail === OWNER_USER) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
    }
    if (rawPassword.length < 4) {
      return res.status(400).json({ ok: false, error: 'Password must be at least 4 characters.' });
    }

    const users = readUsers();
    if (users.some((u) => u.email === cleanEmail)) {
      return res.status(409).json({ ok: false, error: 'An account with this email already exists.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const newUser: StoredUser = {
      id: `user_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      name: cleanName,
      email: cleanEmail,
      salt,
      passwordHash: hashPassword(rawPassword, salt),
      savedDesignIds: [],
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeUsers(users);

    const token = signToken({
      sub: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: 'member',
    });

    return res.status(201).json({
      ok: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: 'member',
        savedDesignIds: [],
      },
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body ?? {};
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const rawPassword = typeof password === 'string' ? password : '';

    if (normalizedEmail === OWNER_USER && rawPassword === OWNER_PASS) {
      const token = signToken({
        sub: OWNER_USER,
        email: OWNER_USER,
        name: 'DilanMax',
        role: 'admin',
      });
      return res.json({
        ok: true,
        token,
        user: {
          name: 'DilanMax',
          email: OWNER_USER,
          role: 'admin',
          savedDesignIds: [],
        },
      });
    }

    const users = readUsers();
    const matched = users.find((u) => u.email === normalizedEmail);
    if (!matched || !verifyPassword(rawPassword, matched.salt, matched.passwordHash)) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password.' });
    }

    const token = signToken({
      sub: matched.id,
      email: matched.email,
      name: matched.name,
      role: 'member',
    });

    return res.json({
      ok: true,
      token,
      user: {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        role: 'member',
        savedDesignIds: matched.savedDesignIds || [],
      },
    });
  });

  app.get('/api/auth/verify', (req, res) => {
    const decoded = decodeToken(getBearerToken(req));
    if (!decoded) {
      return res.json({ authenticated: false, user: null });
    }

    if (decoded.role === 'admin') {
      return res.json({
        authenticated: true,
        user: {
          name: 'DilanMax',
          email: OWNER_USER,
          role: 'admin',
          savedDesignIds: [],
        },
      });
    }

    const users = readUsers();
    const matched = users.find((u) => u.id === decoded.sub);
    if (!matched) {
      return res.json({ authenticated: false, user: null });
    }

    return res.json({
      authenticated: true,
      user: {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        role: 'member',
        savedDesignIds: matched.savedDesignIds || [],
      },
    });
  });

  app.post('/api/user/saved', (req, res) => {
    const decoded = decodeToken(getBearerToken(req));
    if (!decoded) {
      return res.status(401).json({ error: 'Please login to save designs.' });
    }
    const { designId } = req.body ?? {};
    if (!designId || typeof designId !== 'string') {
      return res.status(400).json({ error: 'Design ID required.' });
    }

    if (decoded.role === 'admin') {
      return res.json({ savedDesignIds: [] });
    }

    const users = readUsers();
    const index = users.findIndex((u) => u.id === decoded.sub);
    if (index === -1) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    const current = users[index].savedDesignIds || [];
    const exists = current.includes(designId);
    const updated = exists ? current.filter((id) => id !== designId) : [...current, designId];
    users[index].savedDesignIds = updated;
    writeUsers(users);

    return res.json({ savedDesignIds: updated });
  });

  app.get('/api/designs', (_req, res) => {
    const designs = readDesigns().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json({ designs });
  });

  app.post('/api/designs', (req, res) => {
    const decoded = decodeToken(getBearerToken(req));
    if (!decoded || decoded.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, category, finish, dimensions, description, imageData, imageUrl, fiverrUrl } = req.body ?? {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Design title is required.' });
    }

    let resolvedImageUrl = '';
    try {
      if (typeof imageData === 'string' && imageData.startsWith('data:image/')) {
        const saved = saveBase64Image(imageData);
        if (!saved) {
          return res.status(400).json({ error: 'Unsupported image format. Use PNG, JPG, or WebP.' });
        }
        resolvedImageUrl = saved;
      } else if (typeof imageUrl === 'string' && imageUrl.trim()) {
        resolvedImageUrl = imageUrl.trim();
      } else {
        return res.status(400).json({ error: 'Please upload a Mylar bag image or provide an image URL.' });
      }
    } catch (err) {
      return res.status(400).json({ error: err instanceof Error ? err.message : 'Image processing failed.' });
    }

    const allowedCategories = ['3.5g Stand-Up', 'Die-Cut Shape', 'Holographic Foil', 'Matte & Spot UV'] as const;
    const validCategory = allowedCategories.includes(category) ? category : '3.5g Stand-Up';

    const newDesign: StoredDesign = {
      id: `mylar_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      title: title.trim().slice(0, 120),
      category: validCategory,
      finish: typeof finish === 'string' && finish.trim() ? finish.trim().slice(0, 100) : 'Matte Soft-Touch + Foil',
      dimensions: typeof dimensions === 'string' && dimensions.trim() ? dimensions.trim().slice(0, 80) : '4.0" × 5.0" · Stand-Up',
      description:
        typeof description === 'string' && description.trim()
          ? description.trim().slice(0, 400)
          : 'Custom print-ready Mylar bag layout with bleed, die-line separation, and 3D mockup.',
      imageUrl: resolvedImageUrl,
      fiverrUrl:
        typeof fiverrUrl === 'string' && fiverrUrl.trim().startsWith('http')
          ? fiverrUrl.trim()
          : DEFAULT_FIVERR_URL,
      createdAt: new Date().toISOString(),
    };

    const designs = readDesigns();
    designs.unshift(newDesign);
    writeDesigns(designs);

    return res.status(201).json({ design: newDesign });
  });

  app.put('/api/designs/:id', (req, res) => {
    const decoded = decodeToken(getBearerToken(req));
    if (!decoded || decoded.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const designs = readDesigns();
    const index = designs.findIndex((d) => d.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Design not found.' });
    }

    const existing = designs[index];
    const { title, category, finish, dimensions, description, imageData, imageUrl, fiverrUrl } = req.body ?? {};

    let nextImageUrl = existing.imageUrl;
    try {
      if (typeof imageData === 'string' && imageData.startsWith('data:image/')) {
        const saved = saveBase64Image(imageData);
        if (saved) nextImageUrl = saved;
      } else if (typeof imageUrl === 'string' && imageUrl.trim()) {
        nextImageUrl = imageUrl.trim();
      }
    } catch (err) {
      return res.status(400).json({ error: err instanceof Error ? err.message : 'Image update failed.' });
    }

    const allowedCategories = ['3.5g Stand-Up', 'Die-Cut Shape', 'Holographic Foil', 'Matte & Spot UV'] as const;

    const updated: StoredDesign = {
      ...existing,
      title: typeof title === 'string' && title.trim() ? title.trim().slice(0, 120) : existing.title,
      category: allowedCategories.includes(category) ? category : existing.category,
      finish: typeof finish === 'string' && finish.trim() ? finish.trim().slice(0, 100) : existing.finish,
      dimensions: typeof dimensions === 'string' && dimensions.trim() ? dimensions.trim().slice(0, 80) : existing.dimensions,
      description:
        typeof description === 'string' && description.trim() ? description.trim().slice(0, 400) : existing.description,
      imageUrl: nextImageUrl,
      fiverrUrl:
        typeof fiverrUrl === 'string' && fiverrUrl.trim().startsWith('http')
          ? fiverrUrl.trim()
          : existing.fiverrUrl,
    };

    designs[index] = updated;
    writeDesigns(designs);

    return res.json({ design: updated });
  });

  app.delete('/api/designs/:id', (req, res) => {
    const decoded = decodeToken(getBearerToken(req));
    if (!decoded || decoded.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const designs = readDesigns();
    const target = designs.find((d) => d.id === id);
    if (!target) {
      return res.status(404).json({ error: 'Design not found.' });
    }

    if (target.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(UPLOADS_DIR, path.basename(target.imageUrl));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          // Ignore file removal error
        }
      }
    }

    const nextDesigns = designs.filter((d) => d.id !== id);
    writeDesigns(nextDesigns);

    return res.json({ ok: true });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(ROOT_DIR, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DilanMax Packaging Studio listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
