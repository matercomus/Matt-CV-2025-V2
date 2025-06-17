import pkg from '@google-cloud/translate';
const { Translate } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the Google Cloud Translation client with API key
const translate = new Translate({
    key: process.env.GOOGLE_TRANSLATE_API_KEY
});

async function translateHTML() {
    try {
        // Validate environment variables
        if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
            throw new Error('Missing required environment variables. Please check your .env file.');
        }

        // Read the original HTML file
        const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
        
        // Create a simple HTML parser to extract text content
        const textContent = htmlContent.replace(/<[^>]*>/g, ' ').trim();
        
        // Translate the content
        const [translation] = await translate.translate(textContent, {
            from: 'en',
            to: 'zh'
        });
        
        // Create a new HTML file with the translated content
        const translatedHTML = htmlContent.replace(textContent, translation);
        
        // Write the translated content to a new file
        fs.writeFileSync(path.join(__dirname, 'index.zh.html'), translatedHTML);
        
        console.log('Translation completed successfully!');
    } catch (error) {
        console.error('Translation failed:', error.message);
        if (error.message.includes('Missing required environment variables')) {
            console.log('\nPlease create a .env file in the project root with the following variable:');
            console.log('GOOGLE_TRANSLATE_API_KEY=your-api-key-here');
        }
    }
}

translateHTML(); 