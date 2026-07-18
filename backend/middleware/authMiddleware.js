const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-vero-key-for-dev-only';

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

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
    res.status(401).json({ error: 'Authorization header missing' });
  }
};

module.exports = authenticateJWT;
