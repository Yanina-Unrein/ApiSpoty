const express = require('express');
const router = express.Router();
const { getArtists, getArtistById, getArtistsByName, getSongsByArtist } = require('../controllers/artistController');

// Ruta para obtener todos los artistas con sus canciones
router.get('/', getArtists);  

// Ruta para buscar artistas por nombre
router.get('/search/:name', getArtistsByName);

// Ruta para obtener canciones de un artista por ID
router.get('/:id/songs', getSongsByArtist);

// Ruta para obtener un artista por ID con sus canciones
router.get('/:id', getArtistById);

module.exports = router;