// models/favorites.js
const db = require('../config/db');

// Agregar canción a favoritos
const addFavorite = async (userId, songId) => {
  try {
    const [result] = await db.execute(
      'INSERT INTO favorites (user_id, song_id) VALUES (?, ?)',
      [userId, songId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error al agregar favorito:', error);
    throw error;
  }
};

// Eliminar canción de favoritos
const removeFavorite = async (userId, songId) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM favorites WHERE user_id = ? AND song_id = ?',
      [userId, songId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    throw error;
  }
};

// Obtener canciones favoritas de un usuario
const getFavoritesByUser = async (userId) => {
  try {
    const [results] = await db.execute(`
      SELECT 
        s.id,
        s.title,
        s.album,
        s.path_song,
        s.image_path,
        a.name as artist_name,
        a.photo as artist_photo
      FROM song s
      JOIN favorites f ON s.id = f.song_id
      LEFT JOIN song_artist sa ON s.id = sa.song_id
      LEFT JOIN artist a ON sa.artist_id = a.id
      WHERE f.user_id = ?
    `, [userId]);
    return results;
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    throw error;
  }
};

// Verificar si una canción está en favoritos
const isFavorite = async (userId, songId) => {
  try {
    const [results] = await db.execute(
      'SELECT 1 FROM favorites WHERE user_id = ? AND song_id = ?',
      [userId, songId]
    );
    return results.length > 0;
  } catch (error) {
    console.error('Error al verificar favorito:', error);
    throw error;
  }
};

module.exports = { 
  addFavorite, 
  removeFavorite, 
  getFavoritesByUser,
  isFavorite 
};