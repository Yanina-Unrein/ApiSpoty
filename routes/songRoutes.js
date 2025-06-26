const express = require('express');
const { createSong, updateSong, deleteSong, getAllSongs, getSongById, addSong, searchSongs } = require('../controllers/songController');

const router = express.Router();

// Log middleware para todas las rutas de songs
router.use((req, res, next) => {
  console.log('Ruta de songs accedida:', req.path);
  next();
});

router.get('/', (req, res, next) => {
  console.log('Ruta GET /');
  getAllSongs(req, res);
});

router.get('/search', (req, res, next) => {
  console.log('Ruta GET /search');
  searchSongs(req, res);
});

router.post('/add', (req, res, next) => {
  console.log('Ruta POST /add');
  addSong(req, res);
});

router.get('/:id', (req, res, next) => {
  console.log('Ruta GET /:id, ID:', req.params.id);
  getSongById(req, res);
});

router.get('/check/:filename', async (req, res) => {
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    const filePath = path.join(__dirname, '../../public/songs', req.params.filename);
    await fs.access(filePath);
    res.json({ exists: true });
  } catch (error) {
    res.json({ exists: false });
  }
});

// Crear una nueva canción
router.post('/create', createSong);

// Actualizar una canción
router.put('/update/:id', updateSong);

// Eliminar una canción
router.delete('/delete/:id', deleteSong);

module.exports = router;