import translate from 'translate';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure translate
translate.engine = 'google';
translate.from = 'en';
translate.to = 'zh';

async function translateHTML() {
    try {
        // Read the original HTML file
        const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
        
        // Create a simple HTML parser to extract text content
        const textContent = htmlContent.replace(/<[^>]*>/g, ' ').trim();
        
        // Translate the content
        const translatedText = await translate(textContent);
        
        // Create a new HTML file with the translated content
        const translatedHTML = htmlContent.replace(textContent, translatedText);
        
        // Write the translated content to a new file
        fs.writeFileSync(path.join(__dirname, 'index.zh.html'), translatedHTML);
        
        console.log('Translation completed successfully!');
    } catch (error) {
        console.error('Translation failed:', error);
    }
}

translateHTML(); 