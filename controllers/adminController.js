const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const artistModel = require('../models/artist');
const categoryModel = require('../models/categoryModel');
const songModel = require('../models/songModel');

const getLogin = (req, res) => {
  res.render('auth/login', { layout: false });
};

const postLogin = async (req, res) => {
  console.log('Intento de login:', req.body.email);
  const { email, password } = req.body;
  
  try {
    const [users] = await db.execute('SELECT * FROM user WHERE email = ?', [req.body.email]);
    console.log('Usuarios encontrados:', users.length);
    
    if (users.length === 0) {
      console.log('Usuario no encontrado');
      req.flash('error_msg', 'Credenciales inválidas');
      return res.redirect('/admin/login');
    }

    const user = users[0];
    console.log('Usuario encontrado:', user.email, 'Rol:', user.role);
    
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    console.log('Coincidencia de contraseña:', isMatch);
    
    if (!isMatch) {
      req.flash('error_msg', 'Credenciales inválidas');
      return res.redirect('/admin/login');
    }

    if (user.role !== 'admin') {
      console.log('Usuario no es admin');
      req.flash('error_msg', 'No tienes permisos de administrador');
      return res.redirect('/admin/login');
    }

     // Guardar en sesión
    req.session.admin = {
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email
    };

    // Guardar explícitamente la sesión y luego redirigir
    req.session.save(err => {
      if (err) {
        console.error('Error al guardar sesión:', err);
        req.flash('error_msg', 'Error en el servidor');
        return res.redirect('/admin/login');
      }
      console.log('Sesión guardada exitosamente. Redirigiendo a /admin');
      res.redirect('/admin');
    });

  } catch (error) {
    console.error('Error en login:', error);
    req.flash('error_msg', 'Error en el servidor');
    res.redirect('/admin/login');
  }
};

const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error al destruir sesión:', err);
      return res.redirect('/admin');
    }
    res.redirect('/admin/login');
  });
};

const dashboard = async (req, res) => {
  try {
    const [songs] = await db.execute('SELECT COUNT(*) as count FROM song');
    const [artists] = await db.execute('SELECT COUNT(*) as count FROM artist');
    const [categories] = await db.execute('SELECT COUNT(*) as count FROM category');

    // 🔽 Agregamos consultas para las últimas canciones y artistas
    const [lastSongs] = await db.execute(`
      SELECT s.title, s.duration, GROUP_CONCAT(a.name SEPARATOR ', ') AS artist_name
      FROM song s
      JOIN song_artist sa ON sa.song_id = s.id
      JOIN artist a ON sa.artist_id = a.id
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT 5
    `);

    const [lastArtists] = await db.execute(`
      SELECT a.name, COUNT(sa.song_id) AS song_count
      FROM artist a
      LEFT JOIN song_artist sa ON sa.artist_id = a.id
      GROUP BY a.id
      ORDER BY a.id DESC
      LIMIT 5
    `);

    res.render('admin/dashboard', {
      title: 'Dashboard',
      songCount: songs[0].count,
      artistCount: artists[0].count,
      categoryCount: categories[0].count,
      lastSongs, 
      lastArtists,
      admin: req.session.admin
    });
  } catch (error) {
    console.error('Error en dashboard:', error);
    req.flash('error_msg', 'Error al cargar el dashboard');
    res.redirect('/admin');
  }
};

const showCreateSongForm = async (req, res) => {
  try {
    const artists = await artistModel.getAllArtists();
    const categories = await categoryModel.getAllCategories();

    res.render('admin/songs/create', {
      title: 'Crear Canción',
      artists,
      categories,
      admin: req.session.admin ,
      success_msg: req.flash('success_msg')[0],
      error_msg: req.flash('error_msg')[0]
    });
  } catch (error) {
    console.error('Error al mostrar formulario de creación de canción:', error);
    req.flash('error_msg', 'Error al cargar el formulario');
    res.redirect('/admin/songs');
  }
};

const showEditSongForm = async (req, res) => {
  try {
    const songId = req.params.id;
    console.log('📥 ID recibido en ruta:', songId);

    const song = await songModel.getSongById(songId);

    const artists = await artistModel.getAllArtists();
    const categories = await categoryModel.getAllCategories();


    res.render('admin/songs/edit', {
      title: 'Editar Canción',
      song,
      artists,
      categories,
      admin: req.session.admin,
      success_msg: req.flash('success_msg'),
      error_msg: req.flash('error_msg')
    });
  } catch (error) {
    console.error('❌ Error al cargar canción para editar:', error);
    req.flash('error_msg', 'Error al cargar la canción');
    res.redirect('/admin/songs');
  }
};


const showCreateArtistForm = (req, res) => {
  res.render('admin/artists/create', { 
    title: 'Crear Artista',
    admin: req.session.admin,
    success_msg: req.flash('success_msg')[0],
    error_msg: req.flash('error_msg')[0]
  });
};

const showEditArtistForm = async (req, res) => {
  try {
    const artistId = req.params.id;
    const artist = await artistModel.getArtistByIdWithSongs(artistId);

    if (!artist) {
      req.flash('error_msg', 'Artista no encontrado');
      return res.redirect('/admin/artists');
    }

    res.render('admin/artists/edit', { 
      title: 'Editar Artista',
      artist, 
      admin: req.session.admin,
      success_msg: req.flash('success_msg')[0],
      error_msg: req.flash('error_msg')[0]
    });
  } catch (error) {
    console.error('Error al cargar el formulario de edición de artista:', error);
    req.flash('error_msg', 'Error al cargar el artista');
    res.redirect('/admin/artists');
  }
};

const showArtists = async (req, res) => {
  try {
    const artists = await artistModel.getArtistsWithSongs();

    res.render('admin/artists/list', {
      title: 'Artistas',
      artists,
      admin: req.session.admin,
      success_msg: req.flash('success_msg')[0],
      error_msg: req.flash('error_msg')[0] 
    });
  } catch (error) {
    console.error('Error al mostrar artistas:', error);
    req.flash('error_msg', 'Error al cargar los artistas');
    res.redirect('/admin');
  }
};

const showCreateCategoryForm = (req, res) => {
  res.render('admin/category/create', {
    title: 'Crear Categoria',
    admin: req.session.admin,
    success_msg: req.flash('success_msg')[0],
    error_msg: req.flash('error_msg')[0]
  });
};

const showCategories = async (req, res) => {
  try {
    const categories = await categoryModel.getAllCategories();

    res.render('admin/category/list', {
      title: 'Categorías',
      categories,
      admin: req.session.admin,
      success_msg: req.flash('success_msg')[0],
      error_msg: req.flash('error_msg')[0]
    });
  } catch (error) {
    console.error('Error al mostrar categorías:', error);
    req.flash('error_msg', 'Error al cargar las categorías');
    res.redirect('/admin');
  }
};

const showEditCategoryForm = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await categoryModel.getCategoryById(categoryId);

    if (!category) {
      req.flash('error_msg', 'Categoría no encontrada');
      return res.redirect('/admin/categories');
    }

    res.render('admin/category/edit', {
      title: 'Editar Categoría',
      category,
      admin: req.session.admin,
      success_msg: req.flash('success_msg')[0],
      error_msg: req.flash('error_msg')[0]
    });
  } catch (error) {
    console.error('Error al cargar la categoría para editar:', error);
    req.flash('error_msg', 'Error al cargar la categoría');
    res.redirect('/admin/categories');
  }
};

module.exports = {
  getLogin,
  postLogin,
  logout,
  dashboard,
  showCreateSongForm,
  showEditSongForm,
  showCreateArtistForm,
  showEditArtistForm,
  showCreateCategoryForm,
  showEditCategoryForm,
  showArtists,
  showCategories
};