const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  role: { type: String, enum: ['master', 'editor'], default: 'editor' },
  isSeeded: { type: Boolean, default: false },
}, { timestamps: true });

AdminSchema.methods.verifyPassword = function (password) {
  if (!this.passwordHash) return false;
  return bcrypt.compareSync(password, this.passwordHash);
};

AdminSchema.statics.createWithPassword = async function (email, password, role = 'editor', isSeeded = false) {
  const hash = bcrypt.hashSync(password, 10);
  return this.create({ email, passwordHash: hash, role, isSeeded });
};

module.exports = mongoose.model('Admin', AdminSchema);
