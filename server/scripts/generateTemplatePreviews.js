import puppeteer from 'puppeteer';
import ejs from 'ejs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templateDir = path.join(__dirname, '..', '..', 'client', 'public', 'templates');
if (!fs.existsSync(templateDir)) {
    fs.mkdirSync(templateDir, { recursive: true });
}

const templates = [
    { name: 'ATS Classic', file: 'ats-classic.png' },
    { name: 'Modern Professional', file: 'modern-professional.png' },
    { name: 'Tech Professional', file: 'tech-professional.png' },
    { name: 'Minimal Executive', file: 'minimal-executive.png' }
];

const sampleResumeData = {
    personalInfo: {
        fullName: "ARJUN SHARMA",
        professionalTitle: "Software Engineer | Google",
        email: "arjun.sharma@email.com",
        phone: "+91 98765 43210",
        location: "Bengaluru, India",
        linkedin: "linkedin.com/in/arjunsharma",
        github: "github.com/arjunsharma",
        portfolioUrl: "github.com/arjunsharma"
    },
    skills: {
        programmingLanguages: ["Java", "Python", "C++", "JavaScript", "SQL"],
        frameworks: ["Spring Boot", "REST APIs", "Microservices", "gRPC", "GCP", "Kubernetes", "Docker", "CI/CD"],
        databases: ["PostgreSQL", "MySQL", "BigQuery", "Redis"],
        technical: ["System Design", "API Design", "Performance Optimization", "Observability"],
        tools: ["Git", "GitHub", "Linux", "Grafana", "Prometheus"],
        softSkills: []
    },
    summary: "Software Engineer with 4+ years of experience building scalable backend services, cloud-native applications, and data-driven platforms. Strong expertise in Java, Python, distributed systems, REST APIs, Google Cloud Platform (GCP), Kubernetes, and performance optimization.",
    experience: [
        {
            jobTitle: "Software Engineer",
            company: "Google",
            location: "Bengaluru, India",
            startDate: "07/2022",
            endDate: "Present",
            currentlyWorking: true,
            responsibilities: "- Designed and maintained scalable backend services supporting high-volume production workloads using Java, Spring Boot, gRPC, and GCP.\n- Improved API p95 latency by ~32% through query optimization, Redis caching, and connection-pool tuning.\n- Built automated monitoring and alerting workflows using Prometheus and Grafana, reducing incident time-to-detection.\n- Developed CI/CD pipelines and deployment automation for containerized services on Kubernetes."
        },
        {
            jobTitle: "Software Engineer Intern",
            company: "Technology Solutions Corp",
            location: "Pune, India",
            startDate: "01/2022",
            endDate: "06/2022",
            currentlyWorking: false,
            responsibilities: "- Developed REST APIs and backend modules using Python and PostgreSQL for internal workflow automation.\n- Added automated unit and integration tests, increasing regression coverage.\n- Optimized database queries, reducing average endpoint response time by ~20%."
        }
    ],
    education: [
        {
            degree: "Bachelor of Technology in Computer Science and Engineering",
            institution: "Savitribai Phule Pune University",
            location: "Pune",
            startYear: "2018",
            endYear: "2022",
            score: "8.9 CGPA"
        }
    ],
    projects: [
        {
            projectName: "Cloud-Native Job Intelligence Platform",
            description: "- Built a service-oriented platform for job discovery, skill extraction, candidate matching, and career insights.\n- Implemented caching, pagination, indexing, and asynchronous processing.",
            technologies: ["Java", "Python", "GCP", "Kubernetes", "PostgreSQL", "Redis"]
        }
    ],
    certifications: [
        {
            certificateName: "Google Cloud Professional Cloud Developer",
            issuingOrganization: "Google Cloud",
            issueDate: "2023"
        }
    ],
    achievements: [
        {
            title: "Google Spot Award",
            description: "Recognized for optimizing critical gRPC service latency in production."
        }
    ],
    sectionOrder: ["summary", "skills", "experience", "projects", "education", "certifications", "achievements"],
    design: {
        fontFamily: "Inter",
        accentColor: "#2563EB",
        spacing: "normal"
    }
};

const pradeepResumeData = {
    personalInfo: {
        fullName: "PRADEEP M",
        professionalTitle: "Data Analyst",
        email: "pradeepm.analyst@gmail.com",
        phone: "+91-99999 99999",
        location: "Hyderabad, Telangana",
        linkedin: "linkedin.com/in/pradeepanalyst",
        portfolioUrl: "github.com/pradeepanalyst"
    },
    skills: {
        programmingLanguages: ["Python", "SQL"],
        frameworks: ["GitHub", "WordPress", "Pandas", "NumPy"],
        databases: [],
        technical: [],
        tools: ["Excel", "Power BI", "Power Query", "Tableau"],
        softSkills: [],
        coursework: [
            "Data Integrity", "Data Governance", "Generative AI", "Requirement Gathering",
            "Data Visualization", "Data Manipulation", "Data Mining", "Business Impact Analysis"
        ]
    },
    resumeName: "Pradeep M Resume",
    template: "Modern Professional",
    sectionOrder: [
        "summary",
        "coursework",
        "experience",
        "projects",
        "skills",
        "education",
        "certifications"
    ],
    summary: "- Proven ability in analyzing large datasets, debugging SQL queries, and transforming data to drive business decisions.\n- Proficient in creating compelling, interactive dashboards using Power BI, enhancing data accessibility and understanding.\n- Strong command over Excel, SQL, Power BI, enabling efficient data manipulation and analysis.\n- Proficient in market research, requirement gathering, qualitative and quantitative analysis.",
    experience: [
        {
            jobTitle: "Data Integrity & Reporting Analyst",
            company: "Deloitte",
            location: "",
            startDate: "June 2024",
            endDate: "Present",
            currentlyWorking: true,
            responsibilities: "- Manage and enhance client data across multiple CRM tools, ensuring up-to-date and accurate information.\n- Perform lead verification by researching on LinkedIn and other sources to identify and correct data inconsistencies.\n- Oversee data accuracy and consistency within Deloitte's databases through ongoing validation, audits, and updates, leveraging strong analytical skills and attention to detail."
        },
        {
            jobTitle: "Data Analyst Intern",
            company: "AtliQ Technologies",
            location: "",
            startDate: "Mar 2024",
            endDate: "Mar 2024",
            currentlyWorking: false,
            responsibilities: "- Performed data variance analysis and debugged SQL queries, demonstrating critical thinking and attention to detail to ensure 100% accuracy in data extraction from MySQL Workbench.\n- Applied advanced data cleaning and data normalization techniques, showcasing problem-solving skills to maintain data integrity and optimize retrieval processes.\n- Designed and delivered customizable dashboards using Power BI, leveraging creativity and stakeholder communication to provide actionable insights."
        }
    ],
    education: [
        {
            degree: "Bachelor of Science - CGPA: 8.45",
            institution: "Vellore Institute of Technology",
            location: "Vellore, Tamil Nadu",
            startYear: "Aug 2020",
            endYear: "May 2023",
            score: "8.45 CGPA"
        }
    ],
    projects: [
        {
            projectName: "Festive Campaign Analysis",
            role: "Feb 2024",
            description: "- During Diwali and Sankranti campaigns across 50+ Southern Indian retail stores, Utilized SQL to analyze transactional data and identify purchase trends. Built an interactive Power BI dashboard for enhanced data visualization. This analysis led to the discovery of a 110% average increase in revenue during both campaigns, informing future strategies.",
            technologies: ["SQL", "Power BI", "PowerPoint"],
            liveDemoUrl: "https://app.powerbi.com",
            githubUrl: ""
        },
        {
            projectName: "Business Insights 360",
            role: "Jan 2024",
            description: "- Modernized Atliq's reporting by replacing Excel with a Power BI dashboard, integrating data from Excel/CSV and SQL. Created a data model and visualizations across 5 departments, optimizing with DAX Studio for a 5% performance boost. This empowered Atliq to make data-driven decisions, projecting a 10% revenue increase and 20% expense reduction.",
            technologies: ["Excel", "Power BI", "Dax", "Power Query", "SQL"],
            liveDemoUrl: "https://app.powerbi.com",
            githubUrl: ""
        },
        {
            projectName: "AtliQ Finance Reports",
            role: "Dec 2023",
            description: "- Created a 4-year P&L Report for Atliq Hardware in Excel, using Pivot Tables and DAX to analyze revenue. Automated data cleaning with Power Query, saving 4 hours, and implemented DAX measures for enhanced user experience, reducing data processing time by 50%. This enabled real-time insights for data-driven decision-making.",
            technologies: ["Excel", "PivotTable", "Dax"],
            liveDemoUrl: "",
            githubUrl: "https://github.com/pradeepanalyst/finance-reports"
        }
    ],
    certifications: [
        {
            certificateName: "Accenture North America: Data Analytics And Visualization",
            issuingOrganization: "Accenture",
            issueDate: "",
            credentialUrl: "https://forage.com"
        },
        {
            certificateName: "Tata Data Visualization: Empowering Business With Effective Insights",
            issuingOrganization: "Tata Group",
            issueDate: "",
            credentialUrl: "https://forage.com"
        },
        {
            certificateName: "Google Data Analytics, Coursera",
            issuingOrganization: "Google",
            issueDate: "",
            credentialUrl: "https://coursera.org"
        },
        {
            certificateName: "Codebasics Community Champion",
            issuingOrganization: "Codebasics",
            issueDate: "",
            credentialUrl: "https://codebasics.io"
        }
    ],
    achievements: [],
    design: {
        fontFamily: "Merriweather",
        accentColor: "#111827",
        spacing: "normal"
    }
};

async function generatePreviews() {
    console.log("Launching Puppeteer...");
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const ejsTemplatePath = path.join(__dirname, '..', 'utils', 'resumeTemplate.ejs');

    for (const t of templates) {
        console.log(`Rendering ${t.name}...`);
        const baseData = t.name === 'Modern Professional' ? pradeepResumeData : sampleResumeData;
        const resumeData = {
            ...baseData,
            resumeName: t.name === 'Modern Professional' ? 'Pradeep M Resume' : `Arjun Sharma (${t.name})`,
            template: t.name,
            design: {
                ...baseData.design,
                fontFamily: (t.name === 'ATS Classic' || t.name === 'Modern Professional') ? 'Merriweather' : 'Inter'
            }
        };

        const html = await ejs.renderFile(ejsTemplatePath, resumeData);
        const page = await browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const outputPath = path.join(templateDir, t.file);
        await page.screenshot({
            path: outputPath,
            clip: { x: 0, y: 0, width: 794, height: 1050 }
        });
        console.log(`Saved screenshot to ${outputPath}`);
        await page.close();
    }

    await browser.close();
    console.log("All previews generated successfully!");
}

generatePreviews().catch(err => {
    console.error("Error generating previews:", err);
    process.exit(1);
});
