const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const path = require('path');
const db = require('./config/db'); 
const songRoutes = require('./routes/songRoutes'); 
const authRoutes = require('./routes/authRoutes'); 
const playlistRoutes = require('./routes/playlistRoutes'); 
const favoritesRoutes = require('./routes/favoritesRoutes'); 
const artistRoutes = require('./routes/artistRoutes');

dotenv.config(); // Carga las variables de entorno

const app = express();

// --------------------- Middlewares ---------------------

// Configuración de CORS
const corsOptions = {
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Content-Range'], 
  credentials: true
};
app.use(cors(corsOptions));

// Middleware para loggear todas las peticiones
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/public', express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      // Headers CORS importantes
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  }
}));

// --------------------- Rutas ---------------------

app.get('/api/check-audio/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'songs', req.params.filename);
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ exists: false });
    }
    res.json({ exists: true });
  });
});

// Rutas de canciones
app.use('/api/songs', songRoutes);

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de playlists
app.use('/api/playlists', playlistRoutes);

// Rutas de favoritos
app.use('/api/favorites', favoritesRoutes);

// Rutas de artista
app.use('/api/artists', artistRoutes);

// --------------------- Servidor ---------------------

// Middleware para rutas no encontradas
app.use((req, res) => {
  console.log('Ruta no encontrada:', req.originalUrl);
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Configuración del puerto
const port = process.env.PORT || 3008;
app.set('port', port);

// Crear servidor HTTP
const server = http.createServer(app);

// Manejo de errores al iniciar el servidor
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requiere privilegios elevados.`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} ya está en uso.`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Confirmación de que el servidor está escuchando
server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  console.log(`Servidor escuchando en ${bind}`);
});

// Iniciar el servidor
server.listen(port);

module.exports = app; 