// controllers/songController.js
const songModel = require('../models/songModel');

// Obtener todas las canciones con sus datos asociados (artista, categoría, playlist)
const getAllSongs = async (req, res) => {
  try {
    const songs = await songModel.getAllSongs();
    res.json(songs);
  } catch (error) {
    console.error('Error al obtener las canciones:', error);
    res.status(500).json({ error: 'Error al obtener las canciones' });
  }
};

// Obtener una canción por ID con sus datos asociados
const getSongById = async (req, res) => {
  try {
    const songId = req.params.id;
    console.log('Controller: Buscando canción con ID:', songId);

    const song = await songModel.getSongById(songId);
    console.log('Controller: Resultado:', song);

    if (!song) {
      console.log('Controller: No se encontró la canción');
      return res.status(404).json({ error: 'Canción no encontrada' });
    }
    res.json(song);
  } catch (error) {
    console.error('Controller: Error:', error);
    res.status(500).json({ error: 'Error al obtener la canción' });
  }
};

// Agregar una canción (sin playlist inicialmente)
const addSong = (req, res) => {
  const songData = req.body;

  songModel.addSong(songData, (err, songId) => {
    if (err) {
      return res.status(500).json({ message: 'Error al agregar la canción' });
    }
    res.status(201).json({ message: 'Canción agregada con éxito', songId });
  });
};

// Buscar canciones por título o artista
const searchSongs = async (req, res) => {
  try {
    const { title, artist } = req.query;
    const songs = await songModel.searchSongs(title, artist);
    res.json(songs);
  } catch (error) {
    console.error('Error en la búsqueda de canciones:', error);
    res.status(500).json({ error: 'Error en la búsqueda de canciones' });
  }
};

module.exports = {
  getAllSongs,
  getSongById,
  addSong,
  searchSongs,
};