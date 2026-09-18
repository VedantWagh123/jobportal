export const defaultResumeData = {
  personalInfo: {
    fullName: "ARJUN SHARMA",
    professionalTitle: "Software Engineer | Google (Sample Profile)",
    email: "arjun.sharma@email.com",
    phone: "+91 98765 43210",
    location: "Bengaluru, India",
    linkedin: "linkedin.com/in/arjunsharma",
    portfolioUrl: "github.com/arjunsharma"
  },
  skills: {
    programmingLanguages: ["Java", "Python", "C++", "JavaScript", "SQL"],
    frameworks: ["Spring Boot", "REST APIs", "Microservices", "Distributed Systems", "gRPC", "GCP", "Kubernetes", "Docker", "Terraform", "CI/CD"],
    databases: ["PostgreSQL", "MySQL", "BigQuery", "Redis"],
    technical: ["System Design", "API Design", "Performance Optimization", "Testing", "Observability"],
    tools: ["Git", "GitHub", "Linux", "Grafana", "Prometheus"],
    softSkills: []
  },
  resumeName: "Arjun Sharma Resume",
  template: "ATS Classic",
  sectionOrder: [
    "summary",
    "skills",
    "experience",
    "projects",
    "education",
    "certifications"
  ],
  summary: "Software Engineer with 4+ years of experience building scalable backend services, cloud-native applications, and data-driven platforms. Strong expertise in Java, Python, C++, distributed systems, REST APIs, SQL, Google Cloud Platform (GCP), Kubernetes, and performance optimization. Experienced in designing reliable production systems, improving service latency, and collaborating across engineering and product teams.",
  experience: [
    {
      jobTitle: "Software Engineer",
      company: "Google",
      location: "Bengaluru, India",
      startDate: "07/2022",
      endDate: "Present",
      currentlyWorking: true,
      responsibilities: "- Designed and maintained scalable backend services supporting high-volume production workloads using Java, Spring Boot, gRPC, and Google Cloud Platform.\n- Improved API p95 latency by approximately 32% through query optimization, Redis caching, connection-pool tuning, and targeted service profiling.\n- Built automated monitoring and alerting workflows using Cloud Monitoring, Prometheus, and Grafana, reducing time-to-detection for production incidents.\n- Developed CI/CD pipelines and deployment automation for containerized services running on Kubernetes, improving release consistency and rollback safety.\n- Collaborated with product, SRE, and security teams to design APIs, review architecture, troubleshoot production issues, and improve service reliability."
    },
    {
      jobTitle: "Software Engineer Intern",
      company: "Technology Company",
      location: "Pune, India",
      startDate: "01/2022",
      endDate: "06/2022",
      currentlyWorking: false,
      responsibilities: "- Developed REST APIs and backend modules using Python and PostgreSQL for an internal workflow platform.\n- Added automated unit and integration tests, increasing regression coverage and improving deployment confidence.\n- Optimized database queries and API response handling, reducing average endpoint response time by approximately 20%."
    }
  ],
  education: [
    {
      degree: "Bachelor of Technology in Computer Science and Engineering",
      institution: "Savitribai Phule Pune University",
      location: "",
      startYear: "2018",
      endYear: "2022",
      score: ""
    }
  ],
  projects: [
    {
      projectName: "Cloud-Native Job Intelligence Platform",
      description: "- Built a service-oriented platform for job discovery, skill extraction, candidate matching, and personalized career insights.\n- Implemented caching, pagination, indexing, asynchronous processing, structured logging, and API validation for production-oriented performance and reliability.",
      technologies: ["Java", "Python", "GCP", "Kubernetes", "PostgreSQL", "Redis"]
    },
    {
      projectName: "AI Resume Optimization Engine",
      description: "- Developed an AI-assisted workflow to extract resume content, identify skills and experience, and generate ATS-oriented improvement suggestions.\n- Designed structured resume data models to support editing, template rendering, versioning, and PDF generation.",
      technologies: ["Python", "NLP", "REST APIs", "React"]
    }
  ],
  certifications: [
    {
      certificateName: "Google Cloud Professional Cloud Developer (Sample)",
      issuingOrganization: "",
      issueDate: ""
    },
    {
      certificateName: "Kubernetes Application Developer (Sample)",
      issuingOrganization: "",
      issueDate: ""
    }
  ],
  achievements: []
};
