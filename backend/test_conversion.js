const { convertPresentation } = require('./utils/convertPresentation');
const path = require('path');
const fs = require('fs');

async function test() {
    const uploadDir = path.join(__dirname, 'uploads');
    const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.pptx') || f.endsWith('.ppt'));

    if (files.length === 0) {
        console.log('No PPT files found in uploads to test with.');
        return;
    }

    const testFile = path.join(uploadDir, files[0]);
    console.log(`Testing conversion with file: ${testFile}`);

    try {
        const slides = await convertPresentation(testFile, 'test-presentation-id');
        console.log('Conversion successful:', slides);
    } catch (error) {
        console.error('Conversion failed:', error);
    }
}

test();
