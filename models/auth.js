// models/auth.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Crear usuario
const createUser = async (first_name, last_name, username, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await db.execute(
    `INSERT INTO user (first_name, last_name, username, email, password) 
     VALUES (?, ?, ?, ?, ?)`,
    [first_name, last_name, username, email, hashedPassword]
  );
  return result;
};

// Verificar credenciales
const verifyUser = async (email, password) => {
  const [users] = await db.execute('SELECT * FROM user WHERE email = ?', [email]);
  
  if (users.length === 0) {
    throw new Error('Credenciales inválidas');
  }

  const user = users[0];
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    throw new Error('Credenciales inválidas');
  }

  return user;
};

// Manejo de reseteo de contraseña
const createResetToken = async (email) => {
  const token = crypto.randomBytes(20).toString('hex');
  const expiresAt = new Date(Date.now() + 3600000); // 1 hora

  await db.execute(
    `UPDATE user 
     SET reset_token = ?, reset_token_expires = ? 
     WHERE email = ?`,
    [token, expiresAt, email]
  );

  return token;
};

const findByResetToken = async (token) => {
  const [users] = await db.execute(
    `SELECT * FROM user 
     WHERE reset_token = ? AND reset_token_expires > NOW()`,
    [token]
  );
  return users[0] || null;
};

const updateUserPassword = async (userId, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await db.execute(
    `UPDATE user 
     SET password = ?, reset_token = NULL, reset_token_expires = NULL 
     WHERE id = ?`,
    [hashedPassword, userId]
  );
};

module.exports = {
  createUser,
  verifyUser,
  createResetToken,
  findByResetToken,
  updateUserPassword
};