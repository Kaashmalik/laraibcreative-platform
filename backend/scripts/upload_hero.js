const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { uploadImage, checkConnection } = require('../src/config/cloudinary');
// path already required above

const uploadHero = async () => {
    try {
        console.log('Checking Cloudinary Connection...');
        const connected = await checkConnection();
        if (!connected) {
            console.error('Failed to connect to Cloudinary');
            process.exit(1);
        }

        const imagePath = path.resolve(__dirname, '../../frontend/public/hero-fashion-model.png');
        console.log(`Uploading: ${imagePath}`);

        const result = await uploadImage(imagePath, 'laraibcreative/hero', {
            public_id: 'hero_fashion_model_v1',
            overwrite: true
        });

        if (result.success) {
            console.log('UPLOAD_SUCCESS');
            console.log(JSON.stringify(result));
        } else {
            console.error('Upload failed:', result.error);
        }
    } catch (error) {
        console.error('Script error:', error);
    }
};

uploadHero();
