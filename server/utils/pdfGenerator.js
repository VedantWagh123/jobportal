import puppeteer from 'puppeteer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateResumePdf = async (resumeData) => {
    let browser;
    try {
        // Render EJS to HTML
        const templatePath = path.join(__dirname, 'resumeTemplate.ejs');
        const html = await ejs.renderFile(templatePath, resumeData);

        // Launch Puppeteer
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            // executablePath may be required in some environments, but omitting it lets Puppeteer use its bundled Chromium
        });

        const page = await browser.newPage();
        
        // Wait until network is idle to ensure fonts are loaded if we add external web fonts later
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px'
            }
        });

        return pdfBuffer;
    } catch (error) {
        console.error("Puppeteer PDF generation error:", error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};
