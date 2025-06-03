//Controller/Artist.js
const artistModel = require('../models/artist');
const songModel = require('../models/songModel')

// Obtener todos los artistas con sus canciones
const getArtists = async (req, res) => {
  try {
    const artists = await artistModel.getArtistsWithSongs();
    
    const processedArtists = artists.map(artist => ({
      ...artist,
      songs: artist.songs.map(song => ({
        ...song,
        path_song: song.path_song || `${song.title.replace(/\s+/g, '_')}.mp3`
      }))
    }));
    
    res.json(processedArtists);
  } catch (error) {
    console.error('Error en getArtists:', error);
    res.status(500).json({ 
      error: 'Error al obtener los artistas',
      details: error.message 
    });
  }
};

// Obtener un artista por ID con sus canciones
const getArtistById = async (req, res) => {
  try {
    const artistId = req.params.id;
    const artist = await artistModel.getArtistByIdWithSongs(artistId);
    if (!artist) {
      return res.status(404).json({ error: 'Artista no encontrado' });
    }
    res.json(artist);
  } catch (error) {
    console.error('Error en getArtistById:', error);
    res.status(500).json({ error: 'Error al obtener el artista' });
  }
};

// Buscar artistas por nombre
const getArtistsByName = async (req, res) => {
  try {
    const name = req.params.name;
    const artists = await artistModel.getArtistsByName(name);
    
    if (artists.length === 0) {
      return res.status(404).json({ message: 'No se encontraron artistas con ese nombre' });
    }
    
    res.json(artists);
  } catch (error) {
    console.error('Error en getArtistsByName:', error);
    res.status(500).json({ error: 'Error al buscar artistas' });
  }
};



// Obtener canciones de un artista por ID
const getSongsByArtist = async (req, res) => {
  try {
    const artistId = req.params.id;
    // Cambiamos songModel por artistModel aquí
    const songs = await artistModel.getSongsByArtist(artistId);
    
    if (!songs || songs.length === 0) {
      return res.status(404).json({ message: 'No se encontraron canciones para este artista' });
    }
    
    res.json(songs);
  } catch (error) {
    console.error('Error al obtener las canciones del artista:', error);
    res.status(500).json({ error: 'Error al obtener las canciones del artista' });
  }
};


module.exports = {
  getArtists,
  getArtistById,
  getArtistsByName,
  getSongsByArtist, 
}