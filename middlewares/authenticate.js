// middlewares/authenticate.js
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado. Token requerido.' });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => { 
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
    
    // Obtener usuario completo desde la base de datos
    const [users] = await db.execute('SELECT * FROM user WHERE id = ?', [decoded.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    req.user = users[0];
    next();
  });
};

module.exports = authenticate;