const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
        // Extraer public_id de la URL
        const parts = url.split('/');
        const folderIndex = parts.indexOf('profiles');
        const publicIdParts = parts.slice(folderIndex + 1);
        const publicId = publicIdParts.join('/').split('.')[0];
        
        await cloudinary.uploader.destroy(`spotify-clone/profiles/${publicId}`);
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

const cleanUpCloudinary = async (userModel) => {
  const users = await userModel.getAllUsers();
  const usedImages = users.map(u => u.profile_image).filter(Boolean);
  
  const folderResources = await cloudinary.api.resources({
    type: 'upload',
    prefix: 'spotify-clone/profiles/'
  });

  for (const resource of folderResources.resources) {
    if (!usedImages.includes(resource.secure_url)) {
      await cloudinary.uploader.destroy(resource.public_id);
    }
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  cleanUpCloudinary
};