const db = require('../config/db');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const cloudinaryService = require('../services/cloudinary.service');
const upload = require('../middlewares/uploadMiddleware');

module.exports = {
   // Obtener perfil del usuario actual
  getProfile: async (req, res) => {
    try {
      const user = await userModel.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.json({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        profile_image: user.profile_image,
        username: user.username,
        created_at: user.created_at
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  },

  updateName: async (req, res) => {
     const { first_name, last_name } = req.body;

    if (first_name === undefined && last_name === undefined) {
      return res.status(400).json({ error: 'No se proporcionó nombre ni apellido' });
    }

    try {
      const updatedUser = await userModel.updateUserName(req.user.id, first_name, last_name);
      res.json(updatedUser);
    } catch (error) {
      console.error('Error actualizando nombre:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  updateEmail: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email requerido' });

      const emailInUse = await userModel.isEmailTaken(email, req.user.id);
      if (emailInUse) {
        return res.status(400).json({ error: 'Email ya en uso' });
      }

      const updatedUser = await userModel.updateUserEmail(req.user.id, email);
      
      // Generar nuevo token JWT solo con el email actualizado
      const token = jwt.sign(
        { 
          id: req.user.id,
          email: email, // Nuevo email
          role: req.user.role
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '1h' }
      );

      res.json({ 
        message: 'Email actualizado', 
        user: updatedUser,
        token: token // Nuevo token
      });
    } catch (error) {
      console.error('Error actualizando email:', error);
      res.status(500).json({ error: 'Error al actualizar el email' });
    }
  },

  // Cambiar contraseña
  changeUserPassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      // Cambiado a req.user.id
      await userModel.changePassword(req.user.id, currentPassword, newPassword);
      res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Subir imagen de perfil
  uploadProfileImage: async (req, res) => {
    upload.single('profileImage')(req, res, async (err) => {
      try {
        if (err) {
          console.error('Error uploading image:', err);
          return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
          return res.status(400).json({ error: 'No se proporcionó imagen' });
        }
        
        // Subir imagen a Cloudinary
        const imageUrl = await cloudinaryService.uploadToCloudinary(req.file.buffer);
        
        // Actualizar base de datos - Cambiado a req.user.id
        await db.execute(
          'UPDATE user SET profile_image = ? WHERE id = ?',
          [imageUrl, req.user.id]
        );
        
        const [updatedUser] = await db.execute(
          'SELECT id, first_name, last_name, email, profile_image FROM user WHERE id = ?',
          [req.user.id]
        );
        
        res.json({
          message: 'Imagen de perfil actualizada',
          profile_image: updatedUser[0].profile_image,
          user: updatedUser[0]
        });
      } catch (error) {
        console.error('Error uploading profile image:', error);
        res.status(500).json({ error: 'Error al subir imagen' });
      }
    });
  },

  removeProfileImage: async (req, res) => {
    try {
      // Mantenemos req.user.id
      const userId = req.user.id;
      console.log('UserId para eliminar imagen:', userId);
      // Obtener usuario actual
      const [users] = await db.execute('SELECT profile_image FROM user WHERE id = ?', [userId]);
      if (users.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      const user = users[0];
      
      // Si tiene imagen, eliminar de Cloudinary
      if (user.profile_image) {
        await cloudinaryService.deleteFromCloudinary(user.profile_image);
      }
      
      // Actualizar base de datos
      await db.execute(
        'UPDATE user SET profile_image = NULL WHERE id = ?',
        [userId]
      );
      
      res.json({ profile_image: null });
    } catch (error) {
      console.error('Error deleting profile image:', error);
      
      let errorMessage = 'Error al eliminar imagen de perfil';
      if (error.message.includes('invalid url')) {
        errorMessage = 'Formato de imagen inválido';
      } else if (error.message.includes('not found')) {
        errorMessage = 'La imagen no existe en el servidor';
      }
      
      res.status(500).json({ error: errorMessage });
    }
  },

  deleteAccount: async (req, res) => {
    try {
      // Corregido: usar req.user.id directamente
      const userId = req.user.id;
      
      // Obtener usuario actual
      const [users] = await db.execute('SELECT profile_image FROM user WHERE id = ?', [userId]);
      if (users.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      const user = users[0];
      
      // Eliminar imagen de perfil si existe
      if (user.profile_image) {
        try {
          await cloudinaryService.deleteFromCloudinary(user.profile_image);
        } catch (deleteError) {
          console.error('Error al eliminar imagen:', deleteError);
        }
      }

      // Eliminar cuenta
      await db.execute('DELETE FROM user WHERE id = ?', [userId]);
      res.json({ message: 'Cuenta eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      res.status(500).json({ error: 'Error al eliminar cuenta' });
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