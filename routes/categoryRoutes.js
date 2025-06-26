const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Obtener todas las categorías
router.get('/all', categoryController.getAllCategories);

// Obtener una categoría por ID
router.get('/:id', categoryController.getCategoryById);

// Crear una nueva categoría
router.post('/create', categoryController.createCategory);

// Actualizar una categoría
router.put('/update/:id', categoryController.updateCategory);

// Eliminar una categoría
router.delete('/delete/:id', categoryController.deleteCategory);

// Obtener canciones por categoría
router.get('/:id/songs', categoryController.getSongsByCategory);

module.exports = router;