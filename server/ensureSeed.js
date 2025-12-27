const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');
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

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const role = process.env.SEED_ADMIN_ROLE || 'master';

  if (!email || !password) {
    console.error('SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD not set in .env');
    process.exit(1);
  }

  let admin = await Admin.findOne({ email });
  if (!admin) {
    admin = await Admin.createWithPassword(email, password, role, true);
    console.log(`Created seeded admin ${email} with role ${admin.role}`);
    process.exit(0);
  }

  // Promote and (optionally) reset password
  admin.role = role;
  admin.passwordHash = bcrypt.hashSync(password, 10);
  // ensure seeded flag is set so this account is protected
  admin.isSeeded = true;
  await admin.save();
  console.log(`Updated admin ${email}: role=${admin.role}`);
  process.exit(0);
}

run().catch((err) => { console.error('Error:', err); process.exit(1); });
