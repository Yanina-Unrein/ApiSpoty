// controllers/favoritesController.js
const favoriteModel = require('../models/favorites');

// Agregar a favoritos
const addToFavorites = async (req, res) => {
  try {
    const { userId, songId } = req.body;

    if (!userId || !songId) {
      return res.status(400).json({ error: 'Se requiere userId y songId' });
    }

    const added = await favoriteModel.addFavorite(userId, songId);
    
    if (!added) {
      return res.status(400).json({ error: 'No se pudo agregar a favoritos' });
    }

    res.status(201).json({ message: 'Canción agregada a favoritos' });
  } catch (error) {
    console.error('Error al agregar a favoritos:', error);
    res.status(500).json({ error: 'Error al agregar a favoritos' });
  }
};

// Remover de favoritos
const removeFromFavorites = async (req, res) => {
  try {
    const { userId, songId } = req.params;

    const removed = await favoriteModel.removeFavorite(userId, songId);
    
    if (!removed) {
      return res.status(404).json({ error: 'Favorito no encontrado' });
    }

    res.json({ message: 'Canción removida de favoritos' });
  } catch (error) {
    console.error('Error al remover de favoritos:', error);
    res.status(500).json({ error: 'Error al remover de favoritos' });
  }
};

// Obtener favoritos de usuario
const getFavorites = async (req, res) => {
  try {
    const { userId } = req.params;
    const favorites = await favoriteModel.getFavoritesByUser(userId);
    res.json(favorites);
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
};

// Verificar si es favorito
const checkFavorite = async (req, res) => {
  try {
    const { userId, songId } = req.params;
    const isFavorite = await favoriteModel.isFavorite(userId, songId);
    res.json({ isFavorite });
  } catch (error) {
    console.error('Error al verificar favorito:', error);
    res.status(500).json({ error: 'Error al verificar favorito' });
  }
};

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkFavorite
};