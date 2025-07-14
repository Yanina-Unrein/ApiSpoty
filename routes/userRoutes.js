const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Middleware global para todas las rutas
router.use(authenticate);

// Perfil del usuario actual (sin repetir authenticate)
router.get('/perfil', userController.getProfile);
router.put('/perfil/nombre', userController.updateName);
router.put('/perfil/email', userController.updateEmail);
router.put('/perfil/password', userController.changeUserPassword);
router.post('/perfil/image', userController.uploadProfileImage);
router.delete('/perfil/image', userController.removeProfileImage); 
router.delete('/eliminar-cuenta', userController.deleteAccount);

// Rutas de administrador (requieren autenticación + admin)
router.get('/all', adminMiddleware, userController.getAllUsers);

module.exports = router;