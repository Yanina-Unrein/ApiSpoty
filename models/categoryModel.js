const db = require('../config/db');

module.exports = {
  // Obtener todas las categorías
  getAllCategories: async () => {
    const [results] = await db.execute('SELECT * FROM category');
    return results;
  },

  // Obtener categoría por ID
  getCategoryById: async (categoryId) => {
    const [results] = await db.execute('SELECT * FROM category WHERE id = ?', [categoryId]);
    return results[0] || null;
  },

  // Crear una nueva categoría
  createCategory: async (name) => {
    const [result] = await db.execute(
      'INSERT INTO category (name) VALUES (?)',
      [name]
    );
    return { id: result.insertId, name };
  },

  // Actualizar una categoría
  updateCategory: async (categoryId, name) => {
    const [result] = await db.execute(
      'UPDATE category SET name = ? WHERE id = ?',
      [name, categoryId]
    );
    if (result.affectedRows === 0) {
      throw new Error('Categoría no encontrada');
    }
    return { id: categoryId, name };
  },

  // Eliminar una categoría
  deleteCategory: async (categoryId) => {
    const [result] = await db.execute('DELETE FROM category WHERE id = ?', [categoryId]);
    if (result.affectedRows === 0) {
      throw new Error('Categoría no encontrada');
    }
    return true;
  },

  // Obtener canciones por categoría
  getSongsByCategory: async (categoryId) => {
    const [results] = await db.execute(`
      SELECT song.* 
      FROM song
      INNER JOIN song_category ON song.id = song_category.song_id
      WHERE song_category.category_id = ?
    `, [categoryId]);
    return results;
  }
};