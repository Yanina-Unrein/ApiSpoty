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

  // Actualizar perfil de usuario
  updateUserProfile: async (userId, updateData) => {
    const { first_name, last_name, username, email } = updateData;
    
    await db.execute(
      `UPDATE user 
       SET first_name = ?, last_name = ?, username = ?, email = ?
       WHERE id = ?`,
      [first_name, last_name, username, email, userId]
    );
    
    return this.getUserById(userId);
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