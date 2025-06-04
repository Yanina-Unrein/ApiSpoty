const express = require('express');
const router = express.Router();
const authenticate  = require('../middlewares/authenticate');
const {
  createPlaylist,
  deletePlaylist,
  getPlaylistsByUser,
  addSongToPlaylist,
  removeSongFromPlaylist,
  getPlaylistById,
  updatePlaylist,
  getPlaylistsByOtherUsers
} = require('../controllers/playlistController');

// Rutas de playlist
router.post('/createPlaylist', authenticate, createPlaylist);
router.get('/user/:userId', authenticate, getPlaylistsByUser);
router.get('/:id', authenticate, getPlaylistById);
router.put('/:id/update', authenticate, updatePlaylist);
router.delete('/:id/delete', authenticate, deletePlaylist);

router.post('/add-song', authenticate, addSongToPlaylist);
router.delete('/remove-song/:songId', authenticate, removeSongFromPlaylist);

router.get('/others/:userId', (req, res, next) => {
  if (req.headers['authorization']) {
    return authenticate(req, res, next);
  }
  next();
}, getPlaylistsByOtherUsers);


module.exports = router;