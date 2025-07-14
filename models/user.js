const db = require('../config/db');
const bcrypt = require('bcrypt');

module.exports = {
  // Obtener usuario por ID
  getUserById: async (id) => {
    const [users] = await db.execute('SELECT * FROM user WHERE id = ?', [id]);
    if (users.length === 0) return null;
    
    const user = users[0];
    // Eliminar campos sensibles
    delete user.password;
    delete user.reset_token;
    delete user.reset_token_expires;
    
    return user;
  },

  isEmailTaken: async (email, excludeUserId) => {
    const [users] = await db.execute(
      'SELECT id FROM user WHERE email = ? AND id != ?',
      [email, excludeUserId]
    );
    return users.length > 0;
  },

  // Actualizar perfil de usuario
  updateUserName: async (userId, first_name, last_name) => {
    const fields = [];
    const values = [];

    if (first_name !== undefined) {
      fields.push('first_name = ?');
      values.push(first_name);
    }
    if (last_name !== undefined) {
      fields.push('last_name = ?');
      values.push(last_name);
    }

    if (fields.length === 0) {
      // No hay campos para actualizar, devolvemos usuario sin cambios
      return module.exports.getUserById(userId);
    }

    values.push(userId);
    const sql = `UPDATE user SET ${fields.join(', ')} WHERE id = ?`;

    await db.execute(sql, values);
    return module.exports.getUserById(userId);
  },

  // Actualizar solo el email
  updateUserEmail: async (userId, email) => {
    await db.execute(
      `UPDATE user SET email = ? WHERE id = ?`,
      [email, userId]
    );
    return module.exports.getUserById(userId);
  },

  // Cambiar contraseña
  changePassword: async (userId, currentPassword, newPassword) => {
    const [users] = await db.execute('SELECT password FROM user WHERE id = ?', [userId]);
    const user = users[0];
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error('Contraseña actual incorrecta');
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute(
      `UPDATE user SET password = ? WHERE id = ?`,
      [hashedPassword, userId]
    );
  },

  // Actualizar imagen de perfil
  updateProfileImage: async (userId, imagePath) => {
    await db.execute(
      'UPDATE user SET profile_image = ? WHERE id = ?',
      [imagePath, userId]
    );
    
    return this.getUserById(userId);
  },

  deleteUser: async (userId) => {
    const [result] = await db.execute(
      `DELETE FROM user WHERE id = ?`,
      [userId]
    );
    return result.affectedRows > 0;
  },

  // Obtener todos los usuarios (solo admin)
  getAllUsers: async () => {
    const [users] = await db.execute(`
      SELECT id, first_name, last_name, username, email, role, profile_image
      FROM user
    `);
    return users;
  }
};