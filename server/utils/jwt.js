const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'serveease_super_secure_jwt_secret_key_2026_antigravity',
    {
      expiresIn: '30d',
    }
  );
};

module.exports = { generateToken };

