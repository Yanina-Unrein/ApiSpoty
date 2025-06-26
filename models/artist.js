const db = require('../config/db');

const createArtist = async (name, photoUrl) => {
  try {
    const [result] = await db.execute(
      'INSERT INTO artist (name, photo) VALUES (?, ?)',
      [name, photoUrl]
    );

    return { id: result.insertId, name, photo: photoUrl };
  } catch (error) {
    console.error('Error al crear artista:', error);
    throw error;
  }
};

// Actualizar un artista
const updateArtist = async (artistId, name, photoUrl) => {
  try {
    const [result] = await db.execute(
      'UPDATE artist SET name = ?, photo = ? WHERE id = ?',
      [name, photoUrl, artistId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Artista no encontrado');
    }

    return { id: artistId, name, photo: photoUrl };
  } catch (error) {
    console.error('Error al actualizar artista:', error);
    throw error;
  }
};

// Eliminar un artista
const deleteArtist = async (artistId) => {
  try {
    const [result] = await db.execute('DELETE FROM artist WHERE id = ?', [artistId]);
    
    if (result.affectedRows === 0) {
      throw new Error('Artista no encontrado');
    }
    
    return true;
  } catch (error) {
    console.error('Error al eliminar artista:', error);
    throw error;
  }
};

// Obtener todos los artistas con sus canciones
const getArtistsWithSongs = async () => {
  const [results] = await db.execute(`
    SELECT 
      artist.id, 
      artist.name, 
      artist.photo,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', song.id,
          'title', song.title,
          'path_song', song.path_song,
          'duration', song.duration,
          'image_path', song.image_path
        )
      ) AS songs
    FROM artist
    LEFT JOIN song_artist ON artist.id = song_artist.artist_id
    LEFT JOIN song ON song_artist.song_id = song.id
    GROUP BY artist.id
  `);

  return results.map(row => {
    let songs = [];

    if (typeof row.songs === 'string') {
      try {
        songs = JSON.parse(row.songs);
      } catch (e) {
        console.error('Error al parsear canciones:', e.message);
      }
    } else if (Array.isArray(row.songs)) {
      songs = row.songs;
    }

    return {
      ...row,
      songs: songs.filter(song => song && song.id) // opcional: filtra basura
    };
  });
};

// Obtener un artista por ID con sus canciones
const getArtistByIdWithSongs = async (artistId) => {
  const [results] = await db.execute(`
    SELECT 
      artist.id, 
      artist.name, 
      artist.photo,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', song.id,
          'title', song.title,
          'path_song', song.path_song,
          'duration', song.duration,
          'image_path', song.image_path
        )
      ) AS songs
    FROM artist
    LEFT JOIN song_artist ON artist.id = song_artist.artist_id
    LEFT JOIN song ON song_artist.song_id = song.id
    WHERE artist.id = ?
    GROUP BY artist.id
  `, [artistId]);

  if (results.length === 0) return null;

  let songs = [];

  if (typeof results[0].songs === 'string') {
    try {
      songs = JSON.parse(results[0].songs);
    } catch (e) {
      console.error('Error al parsear canciones del artista:', e.message);
    }
  } else if (Array.isArray(results[0].songs)) {
    songs = results[0].songs;
  }

  return {
    ...results[0],
    songs: songs.filter(song => song && song.id)
  };
};

// Buscar artistas por nombre
const getArtistsByName = async (name) => {
  const [results] = await db.execute(`
    SELECT 
      artist.id, 
      artist.name, 
      artist.photo,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', song.id,
          'title', song.title
        )
      ) AS songs
    FROM artist
    LEFT JOIN song_artist ON artist.id = song_artist.artist_id
    LEFT JOIN song ON song_artist.song_id = song.id
    WHERE artist.name LIKE ?
    GROUP BY artist.id
  `, [`%${name}%`]);

  return results.map(row => {
    let songs = [];

    if (typeof row.songs === 'string') {
      try {
        songs = JSON.parse(row.songs);
      } catch (e) {
        console.error('Error al parsear canciones por nombre:', e.message);
      }
    } else if (Array.isArray(row.songs)) {
      songs = row.songs;
    }

    return {
      ...row,
      songs: songs.filter(song => song && song.id)
    };
  });
};

// Obtener canciones de un artista por ID
const getSongsByArtist = async (artistId) => {
  try {
    const [results] = await db.execute(`
      SELECT 
        song.id, 
        song.title, 
        song.album, 
        song.path_song, 
        song.duration,
        song.image_path,
        artist.name AS artist_name,
        artist.photo AS artist_photo
      FROM song
      INNER JOIN song_artist ON song.id = song_artist.song_id
      INNER JOIN artist ON song_artist.artist_id = artist.id
      WHERE artist.id = ?
    `, [artistId]);
    return results;
  } catch (error) {
    console.error('Error al obtener las canciones del artista:', error);
    throw error;
  }
};

async function getAllArtists() {
  const [rows] = await db.execute('SELECT id, name FROM artist ORDER BY name ASC');
  return rows;
}

module.exports = {
  createArtist,
  updateArtist,
  deleteArtist,
  getArtistsWithSongs,
  getArtistByIdWithSongs,
  getArtistsByName,
  getSongsByArtist,
  getAllArtists
};