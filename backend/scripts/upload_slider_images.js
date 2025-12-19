const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { uploadImage } = require('../src/config/cloudinary');

const ARTIFACTS_DIR = 'C:/Users/DELL/.gemini/antigravity/brain/b9367880-26c1-4fed-b70f-0c67f3748fa3';

const images = [
    { name: 'hero_bridal', file: 'hero_bridal_luxury_1766074874878.png' },
    { name: 'hero_party', file: 'hero_party_pastel_1766074893643.png' },
    { name: 'hero_velvet', file: 'hero_velvet_winter_1766074910014.png' }
];

const uploadAll = async () => {
    const urls = {};

    for (const img of images) {
        try {
            const imagePath = path.join(ARTIFACTS_DIR, img.file);
            console.log(`Uploading ${img.name}...`);

            const result = await uploadImage(imagePath, 'laraibcreative/hero', {
                public_id: img.name,
                overwrite: true
            });

            if (result.success) {
                console.log(`✅ Uploaded ${img.name}`);
                urls[img.name] = result.url;
            } else {
                console.error(`❌ Failed ${img.name}:`, result.error);
            }
        } catch (error) {
            console.error(`Error processing ${img.name}:`, error);
        }
    }

    fs.writeFileSync('slider_urls.json', JSON.stringify(urls, null, 2));
    console.log('Saved URLs to slider_urls.json');
};

uploadAll();
