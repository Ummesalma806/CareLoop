import { z } from 'zod';
import KnowledgeArticle from '../models/KnowledgeArticle.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const schema = z.object({
  title: z.string().min(5),
  body: z.string().min(20),
  category: z.string().length(24).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']).optional(),
});

// GET /api/articles?search=wifi&category=<id>   (public)
export const listArticles = asyncHandler(async (req, res) => {
  const { search, category } = req.query;
  const filter = { status: 'published' };
  if (category) filter.category = category;
  if (search) {
    const rx = new RegExp(escapeRx(String(search)), 'i');
    filter.$or = [{ title: rx }, { body: rx }, { tags: rx }];
  }
  res.json(await KnowledgeArticle.find(filter).populate('category', 'name').sort('-createdAt').limit(50));
});

// GET /api/articles/:id   (public, counts a view)
export const getArticle = asyncHandler(async (req, res) => {
  const a = await KnowledgeArticle.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
    .populate('category', 'name').populate('author', 'name');
  if (!a) throw new ApiError(404, 'Article not found');
  res.json(a);
});

export const createArticle = asyncHandler(async (req, res) => {
  const data = schema.parse(req.body);
  res.status(201).json(await KnowledgeArticle.create({ ...data, author: req.user._id, branch: req.user.branch || null }));
});

export const updateArticle = asyncHandler(async (req, res) => {
  const data = schema.partial().parse(req.body);
  const a = await KnowledgeArticle.findById(req.params.id);
  if (!a) throw new ApiError(404, 'Article not found');
  if (req.user.role !== 'admin' && String(a.author) !== String(req.user._id)) throw new ApiError(403, 'Only the author or an admin can edit this');
  Object.assign(a, data);
  await a.save();
  res.json(a);
});

export const deleteArticle = asyncHandler(async (req, res) => {
  const a = await KnowledgeArticle.findById(req.params.id);
  if (!a) throw new ApiError(404, 'Article not found');
  if (req.user.role !== 'admin' && String(a.author) !== String(req.user._id)) throw new ApiError(403, 'Only the author or an admin can delete this');
  await a.deleteOne();
  res.json({ message: 'Deleted' });
});

// POST /api/articles/:id/vote  { helpful: true|false }
export const voteArticle = asyncHandler(async (req, res) => {
  const { helpful } = z.object({ helpful: z.boolean() }).parse(req.body);
  const a = await KnowledgeArticle.findByIdAndUpdate(req.params.id, { $inc: helpful ? { helpful: 1 } : { notHelpful: 1 } }, { new: true });
  if (!a) throw new ApiError(404, 'Article not found');
  res.json({ helpful: a.helpful, notHelpful: a.notHelpful });
});
