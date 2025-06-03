// middlewares/authenticate.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado. Token requerido.' });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => { 
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
    
    req.user = user;
    next();
  });
};

module.exports = authenticate;