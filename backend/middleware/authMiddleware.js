const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-vero-key-for-dev-only';

const authenticateJWT = async (req, res, next) => {
  const apiKeyHeader = req.headers['x-api-key'];
  const authHeader = req.headers.authorization;

  // 1. Check API Key
  if (apiKeyHeader) {
    try {
      const keyRec = await prisma.apiKey.findUnique({ where: { key: apiKeyHeader } });
      if (!keyRec || !keyRec.isActive) {
        return res.status(403).json({ error: 'Invalid or revoked API key' });
      }
      req.user = { userId: keyRec.userId, isApi: true };
      return next();
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error verifying API key' });
    }
  }

  // 2. Check JWT
  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }

      req.user = user; // Contains { userId: "cuid" }
      next();
    });
  } else {
    res.status(401).json({ error: 'Authorization header or x-api-key missing' });
  }
};

module.exports = authenticateJWT;
