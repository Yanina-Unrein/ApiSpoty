const { sendResetEmail } = require('../utils/emailService');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); 
const {
  createUser,
  verifyUser,
  createResetToken,
  findByResetToken,
  updateUserPassword
} = require('../models/auth');

// Generar token JWT (ya está correctamente definida)
const generateAuthToken = (user) => {
  return jwt.sign(
    {
      id: user.id, 
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '1h' }
  );
};

// Registrar usuario
const register = async (req, res) => {
  try {
    const { first_name, last_name, username, email, password } = req.body;
    
    // Validación básica
    if (!first_name || !last_name || !username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const result = await createUser(first_name, last_name, username, email, password);
    
    // Obtener usuario recién creado
    const [users] = await db.execute('SELECT * FROM user WHERE id = ?', [result.insertId]);
    const newUser = users[0];
    
    const token = generateAuthToken(newUser);
    const refreshToken = jwt.sign(
      { id: newUser.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      refreshToken,
      user: {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        profile_image: newUser.profile_image
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El email o username ya está en uso' });
    }
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};


// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const user = await verifyUser(email, password);
    const token = generateAuthToken(user);
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      refreshToken,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        role: user.role,
        profile_image: user.profile_image
      }
    });

  } catch (error) {
    console.error('Error en login:', error.message);
    res.status(401).json({ error: error.message || 'Credenciales inválidas' });
  }
};

// Solicitar reseteo de contraseña
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    const [users] = await db.execute(
      'SELECT id, first_name, email FROM user WHERE email = ?', 
      [email]
    );

    if (users.length > 0) {
      const user = users[0];
      const token = await createResetToken(email);
      await sendResetEmail(user.email, token, user.first_name);
    }

    res.json({ 
      message: 'Si el email existe en nuestro sistema, recibirás un enlace para resetear tu contraseña' 
    });
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

// Resetear contraseña
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
    }

    const user = await findByResetToken(token);
    
    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    await updateUserPassword(user.id, newPassword);
    
    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({ error: 'Error al actualizar la contraseña' });
  }
};

const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    const [users] = await db.execute('SELECT id FROM user WHERE email = ?', [email]);
    const exists = users.length > 0;
    
    res.json({ exists });
  } catch (error) {
    console.error('Error en checkEmail:', error);
    res.status(500).json({ error: 'Error al verificar email' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token requerido' });
    }
    
    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // CLAVE: Usar userId consistentemente
    const userId = decoded.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Token inválido: falta user ID' });
    }

    // Buscar usuario
    const [users] = await db.execute('SELECT * FROM user WHERE id = ?', [userId]);
    
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const user = users[0];

    // Generar NUEVOS tokens con funciones centralizadas
    const newAccessToken = generateAuthToken(user);
    const newRefreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Refresh token inválido' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  checkEmail,
  refreshToken
};