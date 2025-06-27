const categoryModel = require('../models/categoryModel');

// Obtener todas las categorías
const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

// Obtener una categoría por ID
const getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await categoryModel.getCategoryById(categoryId);
    
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ error: 'Error al obtener categoría' });
  }
};

// Crear una nueva categoría
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = await categoryModel.createCategory(name);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

// Actualizar una categoría
const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name } = req.body;
    const updatedCategory = await categoryModel.updateCategory(categoryId, name);
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
};

// Eliminar una categoría
const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    await categoryModel.deleteCategory(categoryId);
    req.flash('success_msg', 'Categoría eliminada exitosamente');
    return res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    req.flash('error_msg', 'Error al eliminar categoría');
    return res.redirect('/admin/categories');
  }
};

// Obtener canciones por categoría
const getSongsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const songs = await categoryModel.getSongsByCategory(categoryId);
    res.json(songs);
  } catch (error) {
    console.error('Error al obtener canciones por categoría:', error);
    res.status(500).json({ error: 'Error al obtener canciones por categoría' });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getSongsByCategory
};