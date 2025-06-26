const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');
const adminMiddleware = require('../middlewares/adminMiddleware');
const upload = require('../config/multer');

router.use(authenticate);

// Perfil del usuario actual
router.get('/perfil', userController.getProfile);
router.put('/perfil', userController.updateProfile);
router.put('/perfil/password', userController.changeUserPassword);
router.post(
  '/perfil/image',
  upload.single('profileImage'),
  userController.uploadProfileImage
);

// Rutas de administrador
router.use(adminMiddleware);
router.get('/all', userController.getAllUsers);

module.exports = router;