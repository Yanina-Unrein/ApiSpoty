const express = require('express');
const router = express.Router();
const authenticate  = require('../middlewares/authenticate');
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  checkEmail
} = require('../controllers/authController');

// Autenticación
router.post('/registrarse', register);
router.post('/login', login);

// Recuperación de contraseña
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Ruta protegida de ejemplo
router.get('/perfil', authenticate, (req, res) => {
  res.json({ 
    message: 'Perfil del usuario', 
    userId: req.user.userId,
    role: req.user.role // Añadido para ver el rol
  });
});

router.post('/check-email', checkEmail);

module.exports = router;