// routes/favoritesRoutes.js
const express = require('express');
const router = express.Router();
const {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkFavorite
} = require('../controllers/favoritesController');
const authenticate = require('../middlewares/authenticate');

// Ruta para agregar canción a favoritos
router.post('/add', authenticate, addToFavorites);

// Ruta para eliminar canción de favoritos
router.delete('/:userId/:songId/remove', authenticate, removeFromFavorites);

// Ruta para obtener canciones favoritas de un usuario
router.get('/user/:userId', authenticate, getFavorites);

// Ruta para verificar si una canción es favorita
router.get('/check/:userId/:songId', authenticate, checkFavorite);

module.exports = router;