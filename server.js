const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); 
const db = require('./config/db'); 
const cron = require('node-cron');
const cloudinary = require('cloudinary').v2;
const methodOverride = require('method-override');

const songRoutes = require('./routes/songRoutes'); 
const authRoutes = require('./routes/authRoutes'); 
const playlistRoutes = require('./routes/playlistRoutes'); 
const favoritesRoutes = require('./routes/favoritesRoutes'); 
const artistRoutes = require('./routes/artistRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');


const { cleanUpCloudinary } = require('./services/cloudinary.service');
const userModel = require('./models/user');

dotenv.config();
const app = express();

// --------------------- Middlewares ---------------------

const allowedOrigins = [
  'https://spoty-music-clon.vercel.app',
  /https:\/\/spoty-music-clon-.*\.vercel\.app/,
  'http://localhost:4200',
  'http://localhost:3000'
];

// Configuración de CORS para producción y desarrollo
const corsOptions = {
  origin: function (origin, callback) {
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
  console.log('User-Agent:', req.headers['user-agent']);
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

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const isProduction = process.env.NODE_ENV === 'production';

// Configurar sesiones para autenticación
const session = require('express-session');
app.use(session({
  secret: process.env.SESSION_SECRET || 'clave-secreta-en-desarrollo',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: isProduction,              
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,      
    sameSite: isProduction ? 'none' : 'lax' 
  }
}));

// Middleware para mensajes flash
const flash = require('connect-flash');
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// Middleware para verificar sesión de admin
const checkAdminSession = (req, res, next) => {
  if (req.session.admin) { 
    next();
  } else {
    res.redirect('/admin/login');
  }
};

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

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
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: `${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'not configured'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'API REST de Música', 
    version: '1.0.0',
    endpoints: [
      '/admin',
      '/api/songs',
      '/api/auth', 
      '/api/user',
      '/api/playlists',
      '/api/favorites',
      '/api/artists',
      '/api/categories'
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


app.use('/admin', adminRoutes);

// Rutas de canciones
app.use('/api/songs', songRoutes);

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de perfil usuario
app.use('/api/user', userRoutes);

// Rutas de playlists
app.use('/api/playlists', playlistRoutes);

// Rutas de favoritos
app.use('/api/favorites', favoritesRoutes);

// Rutas de artista
app.use('/api/artists', artistRoutes);

app.use('/api/categories', categoryRoutes);


// ----------------Scripts de limpieza de imágenes en Cloudinary---------------------

cron.schedule('0 3 * * 0', async () => {
  try {
    console.log('Iniciando limpieza programada de Cloudinary...');
    const result = await cleanUpCloudinary(userModel);
    console.log('Limpieza completada:', result);
  } catch (error) {
    console.error('Error en limpieza automática:', error);
  }
});

// --------------------- Configuración del Servidor ---------------------

const port = process.env.PORT || 3008;
const server = http.createServer(app);

// Manejo de errores al iniciar el servidor
server.on('error', (error) => {
  if (error.syscall !== 'listen') throw error;
  
  const bind = `Port ${port}`;
  
  switch (error.code) {
    case 'EACCES':
      console.error(`❌ ${bind} requiere privilegios elevados.`);
      process.exit(1);
    case 'EADDRINUSE':
      console.error(`❌ ${bind} ya está en uso.`);
      process.exit(1);
    default:
      throw error;
  }
});

// Iniciar servidor
server.listen(port, () => {
  console.log(`🚀 Servidor escuchando en puerto ${port}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
  console.log(`🗃️  Base de datos: ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  console.log(`☁️  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME}`);
});

// Manejo graceful de cierre
const shutdown = (signal) => {
  console.log(`\n🛑 Recibida señal ${signal}, cerrando servidor...`);
  server.close(() => {
    console.log('👋 Servidor cerrado correctamente');
    process.exit(0);
  });
  
  // Forzar cierre después de 10 segundos
  setTimeout(() => {
    console.error('⏰ Tiempo de espera agotado, forzando cierre...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;