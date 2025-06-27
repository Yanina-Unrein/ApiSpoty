const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const songController = require('../controllers/songController');
const artistController = require('../controllers/artistController');
const categoryController = require('../controllers/categoryController');

// Rutas de autenticación
router.get('/login', adminController.getLogin);
router.post('/login', adminController.postLogin);
router.get('/logout', adminController.logout);

// Middleware para proteger rutas
const adminAuth = (req, res, next) => {
  console.log('Sesión actual:', req.session.admin);
  
  if (!req.session.admin) { 
    console.log('Redirigiendo a login - Sesión no encontrada');
    return res.redirect('/admin/login');
  }
  
  console.log('Usuario autenticado:', req.session.admin.email);
  next();
};

router.use(adminAuth);

// Panel principal
router.get('/', adminAuth, adminController.dashboard);

// Rutas para canciones
router.get('/songs', adminAuth, songController.renderAdminSongs);
router.get('/songs/create', adminAuth, adminController.showCreateSongForm);
router.post('/songs/create', adminAuth, songController.createSong);
router.get('/songs/edit/:id', adminAuth, adminController.showEditSongForm);
router.post('/songs/update/:id',adminAuth, songController.updateSong);
router.post('/songs/delete/:id',adminAuth, songController.deleteSong);

// Rutas para artistas
router.get('/artists', adminAuth, adminController.showArtists);
router.get('/artists/create',adminAuth, adminController.showCreateArtistForm);
router.post('/artists/create',adminAuth, artistController.createArtist);
router.get('/artists/edit/:id',adminAuth, adminController.showEditArtistForm);
router.post('/artists/update/:id',adminAuth, artistController.updateArtist);
router.post('/artists/delete/:id',adminAuth, artistController.deleteArtist);

// Rutas para categorías
router.get('/categories',adminAuth, adminController.showCategories);
router.get('/categories/create',adminAuth, adminController.showCreateCategoryForm);
router.post('/categories/create',adminAuth, categoryController.createCategory);
router.get('/categories/edit/:id',adminAuth, adminController.showEditCategoryForm);
router.post('/categories/update/:id',adminAuth, categoryController.updateCategory);
router.post('/categories/delete/:id',adminAuth, categoryController.deleteCategory);

module.exports = router;