const mongoose = require('mongoose');

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String },
  excerpt: { type: String },
  content: { type: String },
  coverImage: { type: String },
  pdfUrl: { type: String },
  author: { type: String },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Auto-generate slug from title if missing, and ensure uniqueness.
ArticleSchema.pre('validate', async function (next) {
  if (!this.slug && this.title) {
    let base = slugify(this.title);
    if (!base) base = `article-${Date.now()}`;
    let slug = base;
    // ensure uniqueness by appending a counter if needed
    let counter = 0;
    // build regex to match base or base-<number>
    const re = new RegExp(`^${escapeRegExp(base)}(-\\d+)?$`);
    // find existing slugs that match pattern
    const existing = await mongoose.model('Article').find({ slug: re }).select('slug').lean();
    if (existing && existing.length > 0) {
      const taken = new Set(existing.map(e => e.slug));
      while (taken.has(slug)) {
        counter += 1;
        slug = `${base}-${counter}`;
      }
    }
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model('Article', ArticleSchema);
