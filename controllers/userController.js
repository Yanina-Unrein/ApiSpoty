const userModel = require('../models/user');
const cloudinaryService = require('../services/cloudinary.service');

module.exports = {
  // Obtener perfil del usuario actual
  getProfile: async (req, res) => {
    try {
      const user = await userModel.getUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  },

  // Actualizar perfil
  updateProfile: async (req, res) => {
    try {
      const updatedUser = await userModel.updateUserProfile(req.user.userId, req.body);
      res.json({
        message: 'Perfil actualizado exitosamente',
        user: updatedUser
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email o username ya en uso' });
      }
      res.status(500).json({ error: 'Error al actualizar perfil' });
    }
  },

  // Cambiar contraseña
  changeUserPassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      await userModel.changePassword(req.user.userId, currentPassword, newPassword);
      res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Subir imagen de perfil
  uploadProfileImage: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó imagen' });
      }
      
      // Subir imagen a Cloudinary
      const imageUrl = await cloudinaryService.uploadToCloudinary(req.file.buffer);
      
      // Actualizar base de datos
      const updatedUser = await userModel.updateProfileImage(req.user.userId, imageUrl);
      
      res.json({
        message: 'Imagen de perfil actualizada',
        profile_image: updatedUser.profile_image,
        user: updatedUser
      });
    } catch (error) {
      console.error('Error uploading profile image:', error);
      res.status(500).json({ error: 'Error al subir imagen' });
    }
  },

  // Obtener todos los usuarios (solo admin)
  getAllUsers: async (req, res) => {
    try {
      const users = await userModel.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  }
};