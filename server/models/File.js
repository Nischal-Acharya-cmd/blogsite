const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String },
  size: { type: Number },
  path: { type: String },
  url: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('File', FileSchema);
