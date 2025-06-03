const playlistModel = require('../models/playlist');

// Crear una nueva playlist
const createPlaylist = async (req, res) => {
  try {
    const { userId, title } = req.body;
    
    if (!userId || !title) {
      return res.status(400).json({ error: 'Se requiere userId y title' });
    }

    // No necesitamos pasar el color, el trigger lo manejará
    const playlistId = await playlistModel.createPlaylist(userId, title);
    res.status(201).json({ 
      message: 'Playlist creada exitosamente',
      playlistId 
    });
  } catch (error) {
    console.error('Error al crear playlist:', error);
    res.status(500).json({ error: 'Error al crear la playlist' });
  }
};

// Eliminar una playlist
const deletePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await playlistModel.deletePlaylist(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Playlist no encontrada' });
    }
    
    res.json({ message: 'Playlist eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar playlist:', error);
    res.status(500).json({ error: 'Error al eliminar la playlist' });
  }
};

// Obtener playlists de un usuario
const getPlaylistsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const playlists = await playlistModel.getPlaylistsByUser(userId);
    
    // Asegurarse que todas las playlists tengan array de canciones
    const sanitizedPlaylists = playlists.map(playlist => ({
      ...playlist,
      songs: playlist.songs || []
    }));
    
    res.json(sanitizedPlaylists);
  } catch (error) {
    console.error('Error al obtener playlists:', error);
    res.status(500).json({ error: 'Error al obtener las playlists' });
  }
};

// Agregar canción a playlist
const addSongToPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.body;
    
    if (!playlistId || !songId) {
      return res.status(400).json({ error: 'Se requiere playlistId y songId' });
    }

    const added = await playlistModel.addSongToPlaylist(playlistId, songId);
    
    if (!added) {
      return res.status(404).json({ error: 'No se pudo agregar la canción a la playlist' });
    }
    
    res.json({ message: 'Canción agregada a la playlist exitosamente' });
  } catch (error) {
    console.error('Error al agregar canción:', error);
    res.status(500).json({ error: 'Error al agregar la canción a la playlist' });
  }
};

// Remover canción de playlist
const removeSongFromPlaylist = async (req, res) => {
  try {
    const { songId } = req.params;
    const removed = await playlistModel.removeSongFromPlaylist(songId);
    
    if (!removed) {
      return res.status(404).json({ error: 'No se pudo remover la canción de la playlist' });
    }
    
    res.json({ message: 'Canción removida de la playlist exitosamente' });
  } catch (error) {
    console.error('Error al remover canción:', error);
    res.status(500).json({ error: 'Error al remover la canción de la playlist' });
  }
};

// Obtener una playlist específica
const getPlaylistById = async (req, res) => {
  try {
    const { id } = req.params;
    const playlist = await playlistModel.getPlaylistById(id);
    
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist no encontrada' });
    }
    
    // Asegurarse que la playlist tenga array de canciones
    const sanitizedPlaylist = {
      ...playlist,
      songs: playlist.songs || []
    };
    
    res.json(sanitizedPlaylist);
  } catch (error) {
    console.error('Error al obtener playlist:', error);
    res.status(500).json({ error: 'Error al obtener la playlist' });
  }
};

// Actualizar playlist (solo título)
const updatePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Se requiere el título para actualizar' });
    }

    const updated = await playlistModel.updatePlaylist(id, { title });
    
    if (!updated) {
      return res.status(404).json({ error: 'Playlist no encontrada' });
    }
    
    res.json({ message: 'Playlist actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar playlist:', error);
    res.status(500).json({ error: 'Error al actualizar la playlist' });
  }
};

const getPlaylistsByOtherUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    const playlists = await playlistModel.getPlaylistsByOtherUsers(userId);
    res.json(playlists);
  } catch (error) {
    console.error('Error al obtener playlists de otros usuarios:', error);
    res.status(500).json({ error: 'Error al obtener playlists' });
  }
};

module.exports = {
  createPlaylist,
  deletePlaylist,
  getPlaylistsByUser,
  addSongToPlaylist,
  removeSongFromPlaylist,
  getPlaylistById,
  updatePlaylist,
  getPlaylistsByOtherUsers,
};