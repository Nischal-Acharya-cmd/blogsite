// Seed initial admin user if none exists
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in server/.env');
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const count = await Admin.countDocuments();
  if (count > 0) {
    console.log('Admin user(s) already exist, skipping seeding.');
    process.exit(0);
  }

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@blog.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const role = process.env.SEED_ADMIN_ROLE || 'master';

  try {
    const admin = await Admin.createWithPassword(email, password, role, true);
    console.log('Created seeded admin:', admin.email, 'role:', admin.role);
    console.log('Use this email/password to login:', email, password);
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin:', err.message);
    process.exit(1);
  }
}

run();
