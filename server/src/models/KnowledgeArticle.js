import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: String, lowercase: true, trim: true }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null }, // null = visible to all branches
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    views: { type: Number, default: 0 },
    helpful: { type: Number, default: 0 },
    notHelpful: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Powers GET /api/articles?search=
articleSchema.index({ title: 'text', body: 'text', tags: 'text' }, { weights: { title: 5, tags: 3, body: 1 } });

export default mongoose.model('KnowledgeArticle', articleSchema);
