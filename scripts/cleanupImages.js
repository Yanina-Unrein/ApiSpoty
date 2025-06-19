require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const userModel = require('../models/user');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const cleanUpCloudinary = async (userModel) => {
  try {
    console.log('Iniciando limpieza de Cloudinary...');
    
    // 1. Obtener todos los usuarios con imágenes
    const users = await userModel.getAllUsers();
    const usedImages = users
      .map(u => u.profile_image)
      .filter(url => url && url.includes('cloudinary.com')); // Filtrar URLs válidas

    console.log(`Encontradas ${usedImages.length} imágenes en uso`);

    // 2. Obtener recursos de Cloudinary (paginado para muchos archivos)
    let folderResources = [];
    let nextCursor = null;
    
    do {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'spotify-clone/profiles/',
        max_results: 500,
        next_cursor: nextCursor
      });

      folderResources = folderResources.concat(result.resources);
      nextCursor = result.next_cursor;
    } while (nextCursor);

    console.log(`Encontradas ${folderResources.length} imágenes en Cloudinary`);

    // 3. Filtrar y eliminar imágenes no usadas
    const unusedImages = folderResources.filter(
      resource => !usedImages.includes(resource.secure_url)
    );

    console.log(`Encontradas ${unusedImages.length} imágenes no utilizadas`);

    // 4. Eliminar en lotes para evitar rate limits
    const BATCH_SIZE = 10;
    for (let i = 0; i < unusedImages.length; i += BATCH_SIZE) {
      const batch = unusedImages.slice(i, i + BATCH_SIZE);
      
      await Promise.all(
        batch.map(resource => 
          cloudinary.uploader.destroy(resource.public_id)
            .then(() => console.log(`Eliminada: ${resource.public_id}`))
            .catch(err => console.error(`Error eliminando ${resource.public_id}:`, err.message))
        )
      );
      
      // Pequeña pausa entre lotes
      if (i + BATCH_SIZE < unusedImages.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('Limpieza completada exitosamente');
    return {
      success: true,
      totalImages: folderResources.length,
      unusedDeleted: unusedImages.length,
      remaining: usedImages.length
    };

  } catch (error) {
    console.error('Error en cleanUpCloudinary:', error);
    throw new Error(`Fallo en la limpieza: ${error.message}`);
  }
};

// Ejecutar el script
cleanUpCloudinary()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
});