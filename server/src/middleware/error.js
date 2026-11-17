import { ZodError } from 'zod';

export const notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.originalUrl}` });

export const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Server error';

  if (err instanceof ZodError) { status = 400; message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '); }
  else if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join(', '); }
  else if (err.code === 11000) { status = 409; message = `${Object.keys(err.keyValue)[0]} already exists`; }
  else if (err.name === 'CastError') { status = 400; message = 'Invalid id'; }
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') { status = 401; message = 'Session expired, please log in again'; }

  if (status === 500) console.error(err);
  res.status(status).json({ message });
};
