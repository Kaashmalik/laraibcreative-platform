const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { uploadImage } = require('../src/config/cloudinary');

const ARTIFACTS_DIR = 'C:/Users/DELL/.gemini/antigravity/brain/b9367880-26c1-4fed-b70f-0c67f3748fa3';

const images = [
    { name: 'cat_bridal', file: 'cat_bridal_1766075936202.png' },
    { name: 'cat_party_formal', file: 'cat_party_formal_1766075956219.png' },
    { name: 'cat_casual', file: 'cat_casual_1766075990836.png' }
];

const uploadMoreCats = async () => {
    const urls = {};

    for (const img of images) {
        try {
            const imagePath = path.join(ARTIFACTS_DIR, img.file);
            console.log(`Uploading ${img.name}...`);

            const result = await uploadImage(imagePath, 'laraibcreative/categories', {
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

    fs.writeFileSync('more_cat_urls.json', JSON.stringify(urls, null, 2));
    console.log('Saved to more_cat_urls.json');
};

uploadMoreCats();
