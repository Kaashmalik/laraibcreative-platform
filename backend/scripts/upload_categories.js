const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { uploadImage } = require('../src/config/cloudinary');

const ARTIFACTS_DIR = 'C:/Users/DELL/.gemini/antigravity/brain/b9367880-26c1-4fed-b70f-0c67f3748fa3';

const images = [
    { name: 'cat_ready_made', file: 'cat_ready_made_1766075567024.png' },
    { name: 'cat_replicas', file: 'cat_replicas_1766075588945.png' },
    { name: 'cat_karhai', file: 'cat_karhai_1766075640656.png' },
    { name: 'cat_fabric', file: 'cat_fabric_1766075660278.png' }
];

const uploadCats = async () => {
    const urls = {};
    if (fs.existsSync('category_urls.json')) {
        Object.assign(urls, JSON.parse(fs.readFileSync('category_urls.json')));
    }

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

    fs.writeFileSync('category_urls.json', JSON.stringify(urls, null, 2));
    console.log('Updated category_urls.json');
};

uploadCats();
