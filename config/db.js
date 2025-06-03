require('dotenv').config()
const mysql2 = require('mysql2')

const bd = mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
}).promise();

bd.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos: ', err.stack);
    return;
  }
  console.log('Conectado a la base de datos como id ' + bd.threadId);
});

module.exports = bd;