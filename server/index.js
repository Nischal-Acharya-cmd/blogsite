const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 4000;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set. Copy .env.example to .env and set MONGODB_URI');
  process.exit(1);
}

// require models early so seeding logic can use them
const Admin = require('./models/Admin');

// connect
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');

    // Ensure seeded admin exists when env vars provided.
    // If SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are set, create the admin if missing,
    // or promote to SEED_ADMIN_ROLE if role differs.
    try {
      const seedEmail = process.env.SEED_ADMIN_EMAIL;
      const seedPass = process.env.SEED_ADMIN_PASSWORD;
      const seedRole = process.env.SEED_ADMIN_ROLE || 'master';
      if (seedEmail && seedPass) {
        const existing = await Admin.findOne({ email: seedEmail });
        if (!existing) {
          await Admin.createWithPassword(seedEmail, seedPass, seedRole);
          console.log(`Seeded admin: ${seedEmail}`);
        } else if (existing.role !== seedRole) {
          existing.role = seedRole;
          await existing.save();
          console.log(`Promoted seeded admin ${seedEmail} to role ${seedRole}`);
        } else {
          console.log('Seeded admin already present and correct role.');
        }
      }
    } catch (err) {
      console.error('Admin seeding error:', err);
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Watchdog: periodically ensure seeded admin exists while server is running.
// This protects against accidental manual deletion while the process runs.
const seedWatchdogIntervalMs = Number(process.env.SEED_WATCHDOG_INTERVAL_MS || 30000);
if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
  setInterval(async () => {
    try {
      const seedEmail = process.env.SEED_ADMIN_EMAIL;
      const seedPass = process.env.SEED_ADMIN_PASSWORD;
      const seedRole = process.env.SEED_ADMIN_ROLE || 'master';
      if (!seedEmail || !seedPass) return;
      const existing = await Admin.findOne({ email: seedEmail });
      if (!existing) {
        await Admin.createWithPassword(seedEmail, seedPass, seedRole, true);
        console.log(`Watchdog: recreated seeded admin ${seedEmail}`);
      } else if (!existing.isSeeded || existing.role !== seedRole) {
        existing.isSeeded = true;
        existing.role = seedRole;
        await existing.save();
        console.log(`Watchdog: repaired seeded admin ${seedEmail}`);
      }
    } catch (err) {
      // Non-fatal: log and continue
      console.error('Seed watchdog error:', err && err.message ? err.message : err);
    }
  }, seedWatchdogIntervalMs);
}

const File = require('./models/File');
const Article = require('./models/Article');
const jwt = require('jsonwebtoken');
const { requireAuth } = require('./middleware/auth');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// Token-based email login removed.

// ensure uploads folder exists
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({ storage });

// routes
app.get('/', (req, res) => res.json({ ok: true, msg: 'Backend running' }));

// Auth: login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await admin.verifyPassword(password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET);
  res.json({ token, email: admin.email });
});

// Return current admin based on token
app.get('/api/me', requireAuth, async (req, res) => {
  const a = req.admin;
  res.json({ id: a._id, email: a.email, role: a.role });
});

// Register initial admin (requires ADMIN_SETUP_TOKEN from env)
app.post('/api/auth/register', async (req, res) => {
  const { email, password, setupToken } = req.body;
  const expected = process.env.ADMIN_SETUP_TOKEN;
  if (!expected || setupToken !== expected) return res.status(403).json({ error: 'Not allowed' });
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const seedEmail = process.env.SEED_ADMIN_EMAIL;
  if (seedEmail && email && email.toLowerCase() === seedEmail.toLowerCase()) {
    return res.status(403).json({ error: 'Cannot register the seeded admin via this endpoint' });
  }
  try {
    const doc = await Admin.createWithPassword(email, password);
    res.json({ id: doc._id, email: doc.email });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admins endpoints
app.get('/api/admins', requireAuth, async (req, res) => {
  const admins = await Admin.find().sort({ createdAt: -1 });
  res.json(admins);
});

app.post('/api/admins', requireAuth, async (req, res) => {
  // Only master admins can create other admin accounts
  if (!req.admin || req.admin.role !== 'master') return res.status(403).json({ error: 'Forbidden' });
  const { email, password, role } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const seedEmail = process.env.SEED_ADMIN_EMAIL;
  if (seedEmail && email && email.toLowerCase() === seedEmail.toLowerCase()) {
    return res.status(403).json({ error: 'Cannot create or override the seeded admin via this endpoint' });
  }
  const newRole = role === 'master' ? 'master' : 'editor';
  try {
    const doc = password ? await Admin.createWithPassword(email, password, newRole) : await Admin.create({ email, role: newRole });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admins/:id', requireAuth, async (req, res) => {
  const target = await Admin.findById(req.params.id);
  if (!target) return res.status(404).json({ error: 'Not found' });

  // Permanently protect seeded admin accounts.
  if (target.isSeeded) {
    return res.status(403).json({ error: 'Cannot delete seeded admin' });
  }

  // Only master admins may remove other admin accounts
  if (!req.admin || req.admin.role !== 'master') return res.status(403).json({ error: 'Forbidden' });

  await Admin.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// Secure helper to create or promote the seeded admin.
// Expects { setupToken } in body matching ADMIN_SETUP_TOKEN in env.
app.post('/api/admins/ensure-seed', async (req, res) => {
  try {
    const { setupToken } = req.body || {};
    const expected = process.env.ADMIN_SETUP_TOKEN;
    if (!expected || setupToken !== expected) return res.status(403).json({ error: 'Not allowed' });

    const seedEmail = process.env.SEED_ADMIN_EMAIL;
    const seedPass = process.env.SEED_ADMIN_PASSWORD;
    const seedRole = process.env.SEED_ADMIN_ROLE || 'master';
    if (!seedEmail || !seedPass) return res.status(400).json({ error: 'Seed env vars missing' });

    let admin = await Admin.findOne({ email: seedEmail });
    if (!admin) {
      admin = await Admin.createWithPassword(seedEmail, seedPass, seedRole, true);
      return res.json({ created: true, email: admin.email, role: admin.role });
    }
    let changed = false;
    if (admin.role !== seedRole) {
      admin.role = seedRole;
      changed = true;
    }
    if (!admin.isSeeded) {
      admin.isSeeded = true;
      changed = true;
    }
    if (changed) {
      await admin.save();
      return res.json({ promoted: true, email: admin.email, role: admin.role });
    }
    return res.json({ ok: true, email: admin.email, role: admin.role });
  } catch (err) {
    console.error('ensure-seed error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Articles endpoints
app.get('/api/articles', async (req, res) => {
  // sort by createdAt descending, fall back to _id for insertion order
  const articles = await Article.find().sort({ createdAt: -1, _id: -1 });
  res.json(articles);
});

app.get('/api/articles/:id', async (req, res) => {
  const art = await Article.findById(req.params.id);
  if (!art) return res.status(404).json({ error: 'Not found' });
  res.json(art);
});

// Get article by slug
app.get('/api/articles/slug/:slug', async (req, res) => {
  try {
    const art = await Article.findOne({ slug: req.params.slug });
    if (!art) return res.status(404).json({ error: 'Not found' });
    res.json(art);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/articles', requireAuth, async (req, res) => {
  try {
    const data = req.body;
    // ensure createdAt is set so sorting works even if frontend omitted it
    if (!data.createdAt) data.createdAt = new Date();
    // Ensure there is a slug. Generate a unique slug server-side if missing.
    if (!data.slug) {
      const base = (data.title && String(data.title).trim().length > 0)
        ? String(data.title).toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
        : `article-${Date.now()}`;
      // build regex to match base or base-<number>
      const re = new RegExp(`^${base.replace(/[.*+?^${}()|[\\]\\]/g, '\\\$&')}(?:-\\d+)?$`);
      const existing = await Article.find({ slug: re }).select('slug').lean();
      let slug = base;
      if (existing && existing.length > 0) {
        const taken = new Set(existing.map(e => e.slug));
        let counter = 0;
        while (taken.has(slug)) {
          counter += 1;
          slug = `${base}-${counter}`;
        }
      }
      data.slug = slug;
    }
    const art = await Article.create(data);
    console.log('Article created:', art._id, art.title, art.createdAt);
    res.json(art);
  } catch (err) {
    // If mongoose validation error, send the first meaningful message
    if (err && err.name === 'ValidationError') {
      const firstKey = Object.keys(err.errors || {})[0];
      const message = firstKey ? err.errors[firstKey].message : err.message;
      return res.status(400).json({ error: message || 'Validation failed' });
    }
    res.status(400).json({ error: err.message || 'Article creation failed' });
  }
});

app.put('/api/articles/:id', requireAuth, async (req, res) => {
  try {
    console.log('Article update request:', req.params.id, (req.body && req.body.title) ? req.body.title : 'no-title', 'content-length:', req.body && req.body.content ? String(req.body.content).length : 0);
    const art = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(art);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/articles/:id', requireAuth, async (req, res) => {
  await Article.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// Upload single file
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const origin = req.protocol + '://' + req.get('host');
    const fileUrl = `${origin}/uploads/${req.file.filename}`;

    const doc = await File.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: fileUrl,
    });

    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// List files
app.get('/api/files', async (req, res) => {
  const files = await File.find().sort({ createdAt: -1 }).limit(100);
  res.json(files);
});

// Download / serve file metadata
app.get('/api/files/:id', async (req, res) => {
  try {
    const doc = await File.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve uploaded files publicly (optional)
app.use('/uploads', express.static(UPLOAD_DIR));

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
