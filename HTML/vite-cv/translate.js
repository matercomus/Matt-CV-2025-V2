import translate from 'translate-google';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to extract text nodes from HTML
function extractTextNodes(html) {
    const textNodes = [];
    let currentText = '';
    let inTag = false;
    
    for (let i = 0; i < html.length; i++) {
        if (html[i] === '<') {
            if (currentText.trim().length > 0) {
                textNodes.push(currentText.trim());
                currentText = '';
            }
            inTag = true;
        } else if (html[i] === '>') {
            inTag = false;
        } else if (!inTag) {
            currentText += html[i];
        }
    }
    
    if (currentText.trim().length > 0) {
        textNodes.push(currentText.trim());
    }
    
    return textNodes.filter(text => text.length > 0 && text !== '\n' && !text.match(/^\s+$/));
}

// Function to replace text nodes in HTML
function replaceTextNodes(html, originalTexts, translatedTexts) {
    let result = html;
    
    for (let i = 0; i < originalTexts.length && i < translatedTexts.length; i++) {
        const originalText = originalTexts[i];
        const translatedText = translatedTexts[i];
        
        // Find the original text in the HTML and replace it
        const regex = new RegExp(originalText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        result = result.replace(regex, translatedText);
    }
    
    return result;
}

async function translateHTML() {
    try {
        console.log('Reading HTML file...');
        // Read the original HTML file
        const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
        
        console.log('Extracting text content...');
        // Extract text nodes from HTML
        const textNodes = extractTextNodes(htmlContent);
        console.log(`Found ${textNodes.length} text segments to translate`);
        
        if (textNodes.length === 0) {
            console.log('No text content found to translate.');
            return;
        }
        
        console.log('Translating content...');
        // Translate each text node
        const translatedTexts = [];
        
        // Process translations one by one to avoid overwhelming the free service
        for (let i = 0; i < textNodes.length; i++) {
            const text = textNodes[i];
            console.log(`Translating ${i + 1}/${textNodes.length}: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
            
            try {
                const translated = await translate(text, { from: 'en', to: 'zh' });
                translatedTexts.push(translated);
                console.log(`→ "${translated.substring(0, 50)}${translated.length > 50 ? '...' : ''}"`);
            } catch (error) {
                console.log(`Failed to translate: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}", using original text`);
                translatedTexts.push(text); // Use original text if translation fails
            }
            
            // Add a small delay to be respectful to the free service
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log('Replacing translated content...');
        // Replace text nodes in the original HTML
        const translatedHTML = replaceTextNodes(htmlContent, textNodes, translatedTexts);
        
        // Update the language attribute
        const finalHTML = translatedHTML.replace('lang="en"', 'lang="zh"');
        
        // Write the translated content to a new file
        fs.writeFileSync(path.join(__dirname, 'index.zh.html'), finalHTML);
        
        console.log('Translation completed successfully!');
        console.log(`Translated ${translatedTexts.length} text segments`);
        console.log('Output file: index.zh.html');
        
    } catch (error) {
        console.error('Translation failed:', error.message);
    }
}

translateHTML(); 