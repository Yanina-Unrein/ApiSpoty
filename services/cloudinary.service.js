const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const extractPublicId = (url) => {
  if (!url) return null;
  
  try {
    // Extraer public_id desde URL de Cloudinary
    const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
    if (matches && matches[1]) {
      return matches[1];
    }
    
    // Intentar con otro formato común
    const pathParts = url.split('/');
    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex !== -1 && pathParts.length > uploadIndex + 2) {
      return pathParts.slice(uploadIndex + 2).join('/').split('.')[0];
    }
    
    console.error('URL de Cloudinary inválida:', url);
    return null;
  } catch (e) {
    console.error('Error extrayendo public_id:', e);
    return null;
  }
};

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'spotify-clone/profiles',
        format: 'webp',
        quality: 'auto:good',
        transformation: [
          { width: 300, height: 300, crop: 'fill' },
        ]
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('No response from Cloudinary'));
        resolve(result.secure_url);
      }
    );

    const readableStream = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      }
    });

    readableStream.pipe(uploadStream);
  });
};

const deleteFromCloudinary = async (url) => {
  try {
    // Expresión regular mejorada para extraer el public_id
    const publicId = extractPublicId(url);
    
    if (!publicId) {
      throw new Error('URL de Cloudinary inválida: ' + url);
    }
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result !== 'ok') {
      throw new Error('Error al eliminar la imagen: ' + JSON.stringify(result));
    }
    
    console.log(`Imagen eliminada: ${publicId}`);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

const cleanUpCloudinary = async (userModel) => {
  try {
    const users = await userModel.getAllUsers();
    const usedImages = users.map(u => u.profile_image).filter(Boolean);
    
    const { resources } = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'spotify-clone/profiles/',
      max_results: 500
    });

    for (const resource of resources) {
      if (!usedImages.includes(resource.secure_url)) {
        await cloudinary.uploader.destroy(resource.public_id);
        console.log(`Deleted unused image: ${resource.public_id}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning Cloudinary:', error);
  }
};


module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  cleanUpCloudinary,
  extractPublicId
};