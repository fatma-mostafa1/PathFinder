import { careerColors } from "../constants/colors";
import type { CareerPath } from "../types";

export const careers: CareerPath[] = [
  {
    id: "ai-engineer",
    title: "AI Engineer",
    icon: "hardware-chip-outline",
    description: "Build intelligent systems using machine learning, NLP, vision, and production AI APIs.",
    requiredSkills: ["Python", "ML", "Deep Learning", "APIs"],
    difficulty: "Advanced",
    overview:
      "AI Engineers design, train, integrate, and monitor intelligent features that solve practical product problems.",
    responsibilities: [
      "Build ML-powered product features",
      "Evaluate model quality and reliability",
      "Integrate AI services into applications",
      "Collaborate with data, backend, and product teams"
    ],
    technicalSkills: ["Python", "Linear algebra", "Model evaluation", "PyTorch", "Prompting", "MLOps"],
    tools: ["Python", "PyTorch", "TensorFlow", "Hugging Face", "FastAPI", "Docker"],
    projects: ["AI study assistant", "Document Q&A app", "Computer vision classifier", "Smart recommendation API"],
    roadmapPreview: ["Programming Core", "ML Foundations", "Deep Learning", "AI Products", "MLOps"],
    color: careerColors[0]
  },
  {
    id: "machine-learning-engineer",
    title: "Machine Learning Engineer",
    icon: "git-branch-outline",
    description: "Create scalable ML pipelines, train models, and deploy predictions reliably.",
    requiredSkills: ["Python", "Statistics", "ML", "MLOps"],
    difficulty: "Advanced",
    overview:
      "Machine Learning Engineers turn data science prototypes into reliable systems that can be trained, deployed, and improved.",
    responsibilities: [
      "Design training and inference pipelines",
      "Improve model accuracy and latency",
      "Automate experiments and deployments",
      "Monitor model drift and production health"
    ],
    technicalSkills: ["Python", "Scikit-learn", "Feature engineering", "Model serving", "Cloud", "CI/CD"],
    tools: ["Scikit-learn", "MLflow", "Docker", "Kubernetes", "Airflow", "AWS SageMaker"],
    projects: ["Churn prediction pipeline", "Real-time fraud detector", "Model monitoring dashboard"],
    roadmapPreview: ["Statistics", "ML Algorithms", "Pipelines", "Deployment", "Monitoring"],
    color: careerColors[1]
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    icon: "analytics-outline",
    description: "Analyze data, build predictive models, and communicate insights that guide decisions.",
    requiredSkills: ["Python", "SQL", "Statistics", "Visualization"],
    difficulty: "Intermediate",
    overview:
      "Data Scientists combine statistics, programming, and storytelling to discover patterns and recommend decisions.",
    responsibilities: [
      "Clean and explore datasets",
      "Build predictive and analytical models",
      "Create dashboards and reports",
      "Explain findings to stakeholders"
    ],
    technicalSkills: ["Python", "SQL", "Statistics", "Pandas", "Data visualization", "Experimentation"],
    tools: ["Jupyter", "Pandas", "NumPy", "Power BI", "Tableau", "PostgreSQL"],
    projects: ["Student success analysis", "Sales forecasting", "Recommendation analysis dashboard"],
    roadmapPreview: ["Python", "Statistics", "SQL", "Visualization", "ML Basics"],
    color: careerColors[2]
  },
  {
    id: "software-engineer",
    title: "Software Engineer",
    icon: "code-slash-outline",
    description: "Design, build, test, and maintain high-quality applications and systems.",
    requiredSkills: ["DSA", "OOP", "APIs", "Testing"],
    difficulty: "Intermediate",
    overview:
      "Software Engineers solve product and infrastructure problems through maintainable code, architecture, and teamwork.",
    responsibilities: [
      "Implement application features",
      "Design maintainable modules",
      "Write tests and review code",
      "Debug and improve performance"
    ],
    technicalSkills: ["Data structures", "Algorithms", "OOP", "Git", "Testing", "System design basics"],
    tools: ["GitHub", "VS Code", "Jest", "Postman", "Docker", "CI/CD"],
    projects: ["Task management app", "API-backed dashboard", "Realtime chat app"],
    roadmapPreview: ["Programming", "DSA", "Databases", "APIs", "Testing"],
    color: careerColors[3]
  },
  {
    id: "backend-developer",
    title: "Backend Developer",
    icon: "server-outline",
    description: "Build APIs, databases, authentication, background jobs, and scalable server systems.",
    requiredSkills: ["Node.js", "Databases", "APIs", "Security"],
    difficulty: "Intermediate",
    overview:
      "Backend Developers create the server-side systems that power modern products and connect apps to data.",
    responsibilities: [
      "Design REST and GraphQL APIs",
      "Model database schemas",
      "Implement authentication and authorization",
      "Optimize reliability and performance"
    ],
    technicalSkills: ["Node.js", "Express", "SQL", "NoSQL", "Auth", "Caching", "Testing"],
    tools: ["Node.js", "NestJS", "PostgreSQL", "Redis", "Docker", "Postman"],
    projects: ["Learning platform API", "Job board backend", "Payment-ready ecommerce API"],
    roadmapPreview: ["JavaScript", "APIs", "Databases", "Auth", "Deployment"],
    color: careerColors[4]
  },
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    icon: "desktop-outline",
    description: "Create polished, accessible, responsive web interfaces using modern frontend tools.",
    requiredSkills: ["HTML", "CSS", "React", "UX"],
    difficulty: "Beginner Friendly",
    overview:
      "Frontend Developers translate product requirements and designs into fast, accessible, user-friendly interfaces.",
    responsibilities: [
      "Build responsive user interfaces",
      "Integrate APIs with frontend state",
      "Improve accessibility and performance",
      "Collaborate with designers and backend teams"
    ],
    technicalSkills: ["HTML", "CSS", "TypeScript", "React", "State management", "Testing"],
    tools: ["React", "Next.js", "Vite", "Figma", "Storybook", "Playwright"],
    projects: ["Portfolio dashboard", "Course marketplace UI", "Analytics web app"],
    roadmapPreview: ["Web Basics", "JavaScript", "React", "APIs", "Testing"],
    color: careerColors[5]
  },
  {
    id: "mobile-developer",
    title: "Mobile App Developer",
    icon: "phone-portrait-outline",
    description: "Build native-quality mobile applications for iOS and Android with excellent UX.",
    requiredSkills: ["React Native", "TypeScript", "APIs", "Mobile UX"],
    difficulty: "Intermediate",
    overview:
      "Mobile App Developers create cross-platform and native mobile experiences with smooth flows and reliable data handling.",
    responsibilities: [
      "Build mobile screens and navigation",
      "Integrate device features and APIs",
      "Optimize performance and offline behavior",
      "Ship to app stores"
    ],
    technicalSkills: ["React Native", "TypeScript", "Navigation", "AsyncStorage", "REST APIs", "App store basics"],
    tools: ["Expo", "React Native", "Firebase", "Xcode", "Android Studio", "Figma"],
    projects: ["Study planner app", "Habit tracker", "Career roadmap mobile app"],
    roadmapPreview: ["JavaScript", "React", "React Native", "State", "Deployment"],
    color: careerColors[6]
  },
  {
    id: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    icon: "shield-checkmark-outline",
    description: "Protect systems by analyzing risks, monitoring threats, and applying security controls.",
    requiredSkills: ["Networking", "Linux", "Security", "SIEM"],
    difficulty: "Intermediate",
    overview:
      "Cybersecurity Analysts detect vulnerabilities, investigate threats, and help teams improve security posture.",
    responsibilities: [
      "Monitor alerts and investigate incidents",
      "Assess vulnerabilities and risks",
      "Document security findings",
      "Recommend controls and hardening steps"
    ],
    technicalSkills: ["Networking", "Linux", "Web security", "Threat analysis", "Scripting", "Incident response"],
    tools: ["Wireshark", "Nmap", "Burp Suite", "Splunk", "Kali Linux", "OWASP ZAP"],
    projects: ["Vulnerability lab report", "Secure login audit", "Network monitoring dashboard"],
    roadmapPreview: ["Networking", "Linux", "Web Security", "Threats", "Incident Response"],
    color: careerColors[7]
  },
  {
    id: "cloud-engineer",
    title: "Cloud Engineer",
    icon: "cloud-outline",
    description: "Design and operate cloud infrastructure, deployments, storage, and secure environments.",
    requiredSkills: ["Linux", "Cloud", "Networking", "IaC"],
    difficulty: "Intermediate",
    overview:
      "Cloud Engineers help teams deploy, scale, secure, and monitor applications on modern cloud platforms.",
    responsibilities: [
      "Provision cloud infrastructure",
      "Configure networking and access controls",
      "Support deployments and monitoring",
      "Control cost, reliability, and security"
    ],
    technicalSkills: ["Linux", "Networking", "AWS or Azure", "Terraform", "Containers", "Monitoring"],
    tools: ["AWS", "Azure", "Terraform", "Docker", "CloudWatch", "GitHub Actions"],
    projects: ["Cloud-hosted API", "Static site with CDN", "Infrastructure as code lab"],
    roadmapPreview: ["Linux", "Networking", "Cloud Core", "Containers", "IaC"],
    color: careerColors[8]
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    icon: "sync-circle-outline",
    description: "Automate builds, deployments, infrastructure, monitoring, and release workflows.",
    requiredSkills: ["Linux", "CI/CD", "Docker", "Monitoring"],
    difficulty: "Advanced",
    overview:
      "DevOps Engineers improve delivery speed and reliability by automating the path from code to production.",
    responsibilities: [
      "Create CI/CD pipelines",
      "Automate infrastructure and releases",
      "Manage containers and environments",
      "Improve observability and reliability"
    ],
    technicalSkills: ["Linux", "Git", "Docker", "Kubernetes", "CI/CD", "Monitoring", "Scripting"],
    tools: ["Docker", "Kubernetes", "GitHub Actions", "Jenkins", "Prometheus", "Grafana"],
    projects: ["CI/CD pipeline", "Containerized microservice", "Monitoring stack"],
    roadmapPreview: ["Linux", "Git", "Docker", "CI/CD", "Kubernetes"],
    color: careerColors[9]
  },
  {
    id: "ui-ux-designer",
    title: "UI/UX Designer",
    icon: "color-palette-outline",
    description: "Research, design, prototype, and validate digital products with strong usability.",
    requiredSkills: ["Research", "Wireframes", "Figma", "Usability"],
    difficulty: "Beginner Friendly",
    overview:
      "UI/UX Designers understand users and shape product experiences through research, flows, visual design, and testing.",
    responsibilities: [
      "Conduct user research",
      "Create wireframes and prototypes",
      "Design accessible interfaces",
      "Validate ideas through usability testing"
    ],
    technicalSkills: ["Information architecture", "Interaction design", "Visual design", "Accessibility", "Prototyping"],
    tools: ["Figma", "FigJam", "Maze", "Miro", "Notion", "Loom"],
    projects: ["Student portal redesign", "Mobile app prototype", "Usability test report"],
    roadmapPreview: ["UX Basics", "Research", "Wireframes", "UI Systems", "Testing"],
    color: careerColors[10]
  }
];

export const recommendedCareerIds = [
  "ai-engineer",
  "data-scientist",
  "backend-developer",
  "mobile-developer",
  "cybersecurity-analyst"
];

export const getCareerById = (careerId?: string | null) =>
  careers.find((career) => career.id === careerId) || careers[0];
