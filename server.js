const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // Agregar esta línea que faltaba
const db = require('./config/db'); 
const songRoutes = require('./routes/songRoutes'); 
const authRoutes = require('./routes/authRoutes'); 
const playlistRoutes = require('./routes/playlistRoutes'); 
const favoritesRoutes = require('./routes/favoritesRoutes'); 
const artistRoutes = require('./routes/artistRoutes');

dotenv.config(); // Carga las variables de entorno

const app = express();

// --------------------- Middlewares ---------------------

const allowedOrigins = [
  'https://spoty-music-clon.vercel.app',
  /https:\/\/spoty-music-clon-.*\.vercel\.app/, // Regex para todos los subdominios
  'http://localhost:4200'
];

// Configuración de CORS para producción y desarrollo
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como mobile apps o curl)
    if (!origin) return callback(null, true);
    
    // Verificar contra los orígenes permitidos
    const originIsAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (originIsAllowed || origin.includes('localhost')) {
      callback(null, true);
    } else {
      console.error(`Origen no permitido por CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', req.headers);
  next();
});

// Manejar preflight para todas las rutas
app.options('*', cors(corsOptions));

// Middleware para loggear todas las peticiones
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de archivos estáticos con CORS dinámico
app.use('/public/songs', express.static(path.join(__dirname, 'public', 'songs'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }
}));


// --------------------- Rutas ---------------------

// Ruta de salud para Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'API REST de Música', 
    version: '1.0.0',
    endpoints: [
      '/api/songs',
      '/api/auth', 
      '/api/playlists',
      '/api/favorites',
      '/api/artists'
    ]
  });
});

app.get('/api/check-song/:filename', (req, res) => {
  const songPath = path.join(__dirname, 'public', 'songs', req.params.filename);
  
  fs.access(songPath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ 
        exists: false,
        absolutePath: songPath,
        error: err.message
      });
    }
    res.json({ 
      exists: true,
      url: `/public/songs/${req.params.filename}`
    });
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

// Configuración del puerto (Render asigna automáticamente el puerto)
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
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo graceful de cierre del servidor
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Iniciar el servidor
server.listen(port);

module.exports = app;