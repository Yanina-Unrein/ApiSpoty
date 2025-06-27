// controllers/songController.js
const songModel = require('../models/songModel');

const createSong = async (req, res) => {
  try {
    let { title, album, duration, path_song, image_path, artistIds, categoryIds } = req.body;

    artistIds = Array.isArray(artistIds) ? artistIds : [artistIds];
    categoryIds = Array.isArray(categoryIds) ? categoryIds : (categoryIds ? [categoryIds] : []);

    const newSong = await songModel.createSong({
      title,
      album,
      duration,
      path_song,       
      image_path,      
      artistIds,
      categoryIds
    });

    req.flash('success_msg', 'Canción creada exitosamente');
    res.redirect('/admin/songs');
  } catch (error) {
    console.error('Error al crear canción:', error);
    req.flash('error_msg', 'Error al crear canción');
    res.redirect('/admin/songs/create');
  }
};

// Actualizar una canción
const updateSong = async (req, res) => {
  try {
    const songId = req.params.id;
    const songData = req.body;
    const updatedSong = await songModel.updateSong(songId, songData);
    res.json(updatedSong);
    req.flash('success_msg', 'Canción actualizada exitosamente');
    res.redirect('/admin/songs');
  } catch (error) {
    console.error('Error al actualizar canción:', error);
    res.status(500).json({ error: 'Error al actualizar canción' });
    req.flash('error_msg', 'Error al actualizar canción: ' + error.message);
    res.redirect(`/admin/songs/edit/${req.params.id}`);
  }
};

// Eliminar una canción
const deleteSong = async (req, res) => {
  try {
    const songId = req.params.id;
    await songModel.deleteSong(songId);
    req.flash('success_msg', 'Canción eliminada exitosamente');
    return res.redirect('/admin/songs');
  } catch (error) {
    console.error('Error al eliminar canción:', error);
    req.flash('error_msg', 'Error al eliminar canción');
    return res.redirect('/admin/songs');
  }
};

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

const renderAdminSongs = async (req, res) => {
  try {
    const songs = await songModel.getAllSongs();

    res.render('admin/songs/list', {
      title: 'Canciones',
      songs,
      admin: req.session.admin,
      totalPages: 1, // si no estás paginando aún
      currentPage: 1
    });
  } catch (error) {
    console.error('Error al mostrar las canciones en el panel admin:', error);
    req.flash('error_msg', 'Error al cargar las canciones');
    res.redirect('/admin');
  }
};

module.exports = {
  createSong,
  updateSong,
  deleteSong,
  getAllSongs,
  getSongById,
  addSong,
  searchSongs,
  renderAdminSongs
};