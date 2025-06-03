// models/songModel.js
const db = require('../config/db');

// Obtener todas las canciones con sus datos asociados (artista, categoría, playlist)
const getAllSongs = async () => {
  try {
    const [results] = await db.query(`
      SELECT 
          song.id, 
          song.title, 
          song.album, 
          song.path_song, 
          song.image_path, 
          song.duration,
          MAX(artist.name) AS artist_name, 
          MAX(artist.photo) AS artist_photo, 
          GROUP_CONCAT(DISTINCT category.name SEPARATOR ', ') AS category_name, 
          MAX(playlist.title) AS playlist_title
      FROM song
      LEFT JOIN song_artist ON song.id = song_artist.song_id
      LEFT JOIN artist ON song_artist.artist_id = artist.id
      LEFT JOIN song_category ON song.id = song_category.song_id
      LEFT JOIN category ON song_category.category_id = category.id
      LEFT JOIN playlist ON song.playlist_id = playlist.id
      GROUP BY song.id, song.title, song.album, song.path_song, song.image_path
    `);
    return results;
  } catch (error) {
    console.error('Error al obtener las canciones:', error);
    throw error;
  }
};

// Obtener una canción por ID con sus datos asociados
const getSongById = async (songId) => {
  try {
    const [results] = await db.query(`
      SELECT 
        song.id, 
        song.title, 
        song.album, 
        song.duration,
        song.path_song, 
        song.image_path, 
        MAX(artist.name) AS artist_name, 
        MAX(artist.photo) AS artist_photo, 
        GROUP_CONCAT(DISTINCT category.name SEPARATOR ', ') AS category_name, 
        MAX(playlist.title) AS playlist_title
      FROM song
      LEFT JOIN song_artist ON song.id = song_artist.song_id
      LEFT JOIN artist ON song_artist.artist_id = artist.id
      LEFT JOIN song_category ON song.id = song_category.song_id
      LEFT JOIN category ON song_category.category_id = category.id
      LEFT JOIN playlist ON song.playlist_id = playlist.id
      WHERE song.id = ?
      GROUP BY song.id, song.title, song.album, song.path_song, song.image_path
    `, [songId]);
    return results[0];
  } catch (error) {
    console.error('Error al obtener la canción:', error);
    throw error;
  }
};

// Función para agregar una canción (sin playlist)
const addSong = (songData, callback) => {
  const { title, album, path_song, image_path, duration, playlistId = null, artistId = null } = songData;

  // Verifica que los datos estén bien
  console.log("Datos de la canción:", songData);

  // Inserta solo los datos que corresponden a la tabla song
  const query = `
    INSERT INTO song (title, album, path_song, image_path, duration, playlist_id) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [title, album, path_song, image_path, duration, playlistId], (err, result) => {
    if (err) {
      console.error('Error al insertar la canción:', err);
      return callback(err);
    }

    const songId = result.insertId; // ID de la canción recién insertada

    // Si hay un artistId, insertamos la relación en song_artist
    if (artistId) {
      const relationQuery = `
        INSERT INTO song_artist (song_id, artist_id)
        VALUES (?, ?)
      `;
      
      db.query(relationQuery, [songId, artistId], (err, result) => {
        if (err) {
          console.error('Error al asociar el artista con la canción:', err);
          return callback(err);
        }
        
        // Retorna el ID de la canción y una confirmación
        callback(null, songId);
      });
    } else {
      // Si no hay artistId, solo retorna el ID de la canción
      callback(null, songId);
    }
  });
};

// Buscar canciones por título o artista
const searchSongs = async (title, artist) => {
  try {
    let query = `
      SELECT 
        song.id, 
        song.title, 
        song.album, 
        song.path_song, 
        song.duration,
        song.image_path, 
        MAX(artist.name) AS artist_name, 
        MAX(artist.photo) AS artist_photo, 
        GROUP_CONCAT(DISTINCT category.name SEPARATOR ', ') AS categories, 
        MAX(playlist.title) AS playlist_title
      FROM song
      LEFT JOIN song_artist ON song.id = song_artist.song_id
      LEFT JOIN artist ON song_artist.artist_id = artist.id
      LEFT JOIN song_category ON song.id = song_category.song_id
      LEFT JOIN category ON song_category.category_id = category.id
      LEFT JOIN playlist ON song.playlist_id = playlist.id
      WHERE 1=1
    `;

    const params = [];

    if (title) {
      query += ` AND song.title LIKE ?`;
      params.push(`%${title}%`);
    }

    if (artist) {
      query += ` AND artist.name LIKE ?`;
      params.push(`%${artist}%`);
    }

    query += ` GROUP BY song.id, song.title, song.album, song.path_song, song.image_path`;

    const [results] = await db.query(query, params);
    return results;
  } catch (error) {
    console.error('Error al realizar la búsqueda:', error);
    throw error;
  }
};

module.exports = {
  getAllSongs,
  getSongById,
  addSong,
  searchSongs,
};