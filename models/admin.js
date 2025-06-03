const db = require('../config/db');

const adminModel = {
  logAction: async (adminId, actionType, targetId) => {
    try {
      await db.execute(
        'INSERT INTO admin_actions (admin_id, action_type, target_id) VALUES (?, ?, ?)',
        [adminId, actionType, targetId]
      );
    } catch (error) {
      console.error('Error al registrar acción:', error);
      throw error;
    }
  },

  getCreationStats: async (adminId) => {
    try {
      const [songsCreated] = await db.execute(
        'SELECT COUNT(*) as count FROM admin_actions WHERE admin_id = ? AND action_type = "create_song"',
        [adminId]
      );
      
      const [artistsCreated] = await db.execute(
        'SELECT COUNT(*) as count FROM admin_actions WHERE admin_id = ? AND action_type = "create_artist"',
        [adminId]
      );
      
      return {
        songsCreated: songsCreated[0].count,
        artistsCreated: artistsCreated[0].count
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  },

  getRecentActions: async (adminId, limit = 10) => {
    try {
      const [actions] = await db.execute(
        `SELECT a.action_type, a.created_at, 
         CASE 
           WHEN a.action_type = 'create_song' THEN s.title
           WHEN a.action_type = 'create_artist' THEN ar.name
         END as target_name
         FROM admin_actions a
         LEFT JOIN song s ON a.action_type LIKE '%song%' AND a.target_id = s.id
         LEFT JOIN artist ar ON a.action_type LIKE '%artist%' AND a.target_id = ar.id
         WHERE a.admin_id = ?
         ORDER BY a.created_at DESC
         LIMIT ?`,
        [adminId, limit]
      );
      
      return actions;
    } catch (error) {
      console.error('Error al obtener acciones recientes:', error);
      throw error;
    }
  },

  getAllSongs: async () => {
    try {
      const [songs] = await db.execute(
        'SELECT id, title, artist_id, duration FROM song ORDER BY created_at DESC'
      );
      return songs;
    } catch (error) {
      console.error('Error al obtener canciones:', error);
      throw error;
    }
  },

  getAllArtists: async () => {
    try {
      const [artists] = await db.execute(
        'SELECT id, name FROM artist ORDER BY name ASC'
      );
      return artists;
    } catch (error) {
      console.error('Error al obtener artistas:', error);
      throw error;
    }
  }
};

module.exports = adminModel;