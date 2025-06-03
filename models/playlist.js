const db = require('../config/db');

// Crear una nueva playlist (sin color)
const createPlaylist = async (userId, title) => {
  try {
    const [result] = await db.execute(
      'INSERT INTO playlist (user_id, title) VALUES (?, ?)',
      [userId, title]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error al crear playlist:', error);
    throw error;
  }
};

// Eliminar una playlist
const deletePlaylist = async (playlistId) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM playlist WHERE id = ?',
      [playlistId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error al eliminar playlist:', error);
    throw error;
  }
};

// Obtener playlists de un usuario con sus canciones
const getPlaylistsByUser = async (userId) => {
  try {
    // Primero obtener solo las playlists
    const [playlists] = await db.execute(
      'SELECT id, title, color, user_id FROM playlist WHERE user_id = ?',
      [userId]
    );
    
    // Luego obtener las canciones para cada playlist
    const playlistsWithSongs = await Promise.all(
      playlists.map(async playlist => {
        const [songs] = await db.execute(
          'SELECT id, title, album, path_song, image_path FROM song WHERE playlist_id = ?',
          [playlist.id]
        );
        return {
          ...playlist,
          songs,
          song_count: songs.length
        };
      })
    );
    
    return playlistsWithSongs;
  } catch (error) {
    console.error('Error al obtener playlists:', error);
    throw error;
  }
};

// Agregar canción a playlist
const addSongToPlaylist = async (playlistId, songId) => {
  try {
    const [result] = await db.execute(
      'UPDATE song SET playlist_id = ? WHERE id = ?',
      [playlistId, songId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error al agregar canción a playlist:', error);
    throw error;
  }
};

// Remover canción de playlist
const removeSongFromPlaylist = async (songId) => {
  try {
    const [result] = await db.execute(
      'UPDATE song SET playlist_id = NULL WHERE id = ?',
      [songId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error al remover canción de playlist:', error);
    throw error;
  }
};

// Obtener una playlist específica con sus canciones
const getPlaylistById = async (playlistId) => {
  try {
    // Primero obtener la playlist
    const [playlists] = await db.execute(
      'SELECT id, title, color, user_id FROM playlist WHERE id = ?',
      [playlistId]
    );
    
    if (playlists.length === 0) return null;
    
    const playlist = playlists[0];
    
    // Luego obtener sus canciones
    const [songs] = await db.execute(
      'SELECT id, title, album, path_song, image_path FROM song WHERE playlist_id = ?',
      [playlistId]
    );
    
    return {
      ...playlist,
      songs,
      song_count: songs.length
    };
  } catch (error) {
    console.error('Error al obtener playlist:', error);
    throw error;
  }
};

// Actualizar título de playlist (sin color)
const updatePlaylist = async (playlistId, { title }) => {
  try {
    const [result] = await db.execute(
      'UPDATE playlist SET title = ? WHERE id = ?',
      [title, playlistId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error al actualizar playlist:', error);
    throw error;
  }
};

const getPlaylistsByOtherUsers = async (excludeUserId) => {
  try {
    const [playlists] = await db.execute(
      `SELECT p.*, u.first_name, u.last_name 
        FROM playlist p
        JOIN user u ON p.user_id = u.id
        WHERE p.user_id != ?`,
      [excludeUserId]
    );
    
    return playlists;
  } catch (error) {
    console.error('Error:', error);
    return [];
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
  getPlaylistsByOtherUsers
};