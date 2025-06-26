const express = require('express');
const router = express.Router();
const { createArtist, updateArtist, deleteArtist, getArtists, getArtistById, getArtistsByName, getSongsByArtist } = require('../controllers/artistController');

// Ruta para obtener todos los artistas con sus canciones
router.get('/', getArtists);  

// Ruta para buscar artistas por nombre
router.get('/search/:name', getArtistsByName);

// Ruta para obtener canciones de un artista por ID
router.get('/:id/songs', getSongsByArtist);

// Ruta para obtener un artista por ID con sus canciones
router.get('/:id', getArtistById);

// Ruta para crear un artista
router.post('/create', createArtist);

// Ruta para actualizar un artista
router.put('/update/:id', updateArtist);

// Ruta para eliminar un artista
router.delete('/delete/:id', deleteArtist);


module.exports = router;