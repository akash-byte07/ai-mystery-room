import jwt from 'jsonwebtoken';
export function auth(req, res, next) { try { const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', ''); if (!token) return res.status(401).json({ message: 'Authentication required' }); req.user = jwt.verify(token, process.env.JWT_SECRET); next(); } catch { res.status(401).json({ message: 'Invalid or expired session' }); } }
