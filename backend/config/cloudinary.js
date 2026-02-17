const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a local file to Cloudinary
 * @param {string} filePath - absolute path to the file
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<{url: string, public_id: string}>}
 */
async function uploadToCloudinary(filePath, folder = 'slides') {
    const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
    });
    return { url: result.secure_url, public_id: result.public_id };
}

module.exports = { cloudinary, uploadToCloudinary };
