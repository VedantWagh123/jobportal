import puppeteer from 'puppeteer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateResumePdf = async (rawResumeData = {}) => {
    let browser;
    try {
        const resumeData = {
            resumeName: rawResumeData.resumeName || (rawResumeData.personalInfo?.fullName ? `${rawResumeData.personalInfo.fullName} Resume` : 'Resume'),
            template: rawResumeData.template || 'ATS Classic',
            personalInfo: {
                fullName: '',
                professionalTitle: '',
                email: '',
                phone: '',
                location: '',
                linkedin: '',
                github: '',
                portfolioUrl: '',
                profilePhoto: '',
                ...(rawResumeData.personalInfo || {})
            },
            summary: rawResumeData.summary || '',
            experience: Array.isArray(rawResumeData.experience) ? rawResumeData.experience : [],
            projects: Array.isArray(rawResumeData.projects) ? rawResumeData.projects : [],
            skills: {
                technical: [],
                programmingLanguages: [],
                frameworks: [],
                databases: [],
                tools: [],
                cloudDevOps: [],
                softSkills: [],
                ...(rawResumeData.skills || {})
            },
            education: Array.isArray(rawResumeData.education) ? rawResumeData.education : [],
            certifications: Array.isArray(rawResumeData.certifications) ? rawResumeData.certifications : [],
            achievements: Array.isArray(rawResumeData.achievements) ? rawResumeData.achievements : [],
            sectionOrder: (Array.isArray(rawResumeData.sectionOrder) && rawResumeData.sectionOrder.length > 0)
                ? rawResumeData.sectionOrder
                : ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements'],
            design: {
                fontFamily: 'Inter',
                accentColor: '#3B82F6',
                spacing: 'normal',
                ...(rawResumeData.design || {})
            },
            ...rawResumeData
        };

        // Render EJS to HTML
        const templatePath = path.join(__dirname, 'resumeTemplate.ejs');
        const html = await ejs.renderFile(templatePath, resumeData);

        // Launch Puppeteer
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
        });

        const page = await browser.newPage();
        
        // Fast domcontentloaded and safe fonts readiness check
        await page.setContent(html, { waitUntil: 'domcontentloaded' });
        try {
            await page.evaluate(() => document.fonts.ready);
        } catch {
            // Proceed even if document.fonts.ready rejects
        }

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
            await browser.close().catch(() => {});
        }
    }
};
