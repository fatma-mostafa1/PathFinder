import { getCareerById } from "./careers";
import type { CareerPath, RoadmapPhase } from "../types";
import { normalizeRoadmapProgress } from "../utils/progress";

const skill = (id: string, title: string, course?: string) => ({
  id,
  title,
  course,
  completed: false
});

const specializationByCareer: Record<string, { title: string; description: string; skills: string[]; courses: string[]; projects: string[] }> = {
  "ai-engineer": {
    title: "AI Product Specialization",
    description: "Learn model integration, NLP, computer vision, and responsible AI product workflows.",
    skills: ["Machine learning models", "Deep learning basics", "Prompt engineering", "Model evaluation", "MLOps basics"],
    courses: ["Deep Learning Specialization", "Hugging Face NLP Course", "AI Engineering with Python"],
    projects: ["AI tutor chatbot", "Document Q&A assistant", "Vision classifier"]
  },
  "machine-learning-engineer": {
    title: "Machine Learning Systems",
    description: "Move from notebooks to repeatable training, serving, monitoring, and retraining pipelines.",
    skills: ["Feature engineering", "Model pipelines", "Experiment tracking", "Model serving", "Monitoring"],
    courses: ["Machine Learning Engineering for Production", "Full Stack Deep Learning", "MLflow Tracking"],
    projects: ["Churn model pipeline", "Fraud detection API", "Model drift dashboard"]
  },
  "data-scientist": {
    title: "Data Science Specialization",
    description: "Practice statistics, visualization, experimentation, and predictive analysis for decision-making.",
    skills: ["Exploratory analysis", "Statistics", "Data visualization", "SQL analytics", "ML basics"],
    courses: ["Google Data Analytics", "Kaggle Python", "Practical Statistics for Data Scientists"],
    projects: ["Student success dashboard", "Sales forecast notebook", "A/B test analysis"]
  },
  "software-engineer": {
    title: "Software Engineering Practice",
    description: "Build maintainable applications with testing, architecture, collaboration, and delivery habits.",
    skills: ["Clean architecture", "Testing", "API integration", "System design basics", "Code reviews"],
    courses: ["Software Engineering at Google", "Testing JavaScript", "System Design Primer"],
    projects: ["Task platform", "Realtime chat", "API-backed dashboard"]
  },
  "backend-developer": {
    title: "Backend Specialization",
    description: "Design production APIs with databases, authentication, caching, queues, and observability.",
    skills: ["REST APIs", "Authentication", "SQL schema design", "Caching", "Background jobs"],
    courses: ["Node.js API Masterclass", "PostgreSQL for Developers", "Backend System Design"],
    projects: ["Learning platform API", "Job board backend", "Notification service"]
  },
  "frontend-developer": {
    title: "Frontend Specialization",
    description: "Create responsive, accessible, fast interfaces using React, TypeScript, and frontend testing.",
    skills: ["React components", "State management", "Accessibility", "Performance", "Frontend testing"],
    courses: ["React Docs", "Epic React", "Frontend Masters TypeScript"],
    projects: ["Career dashboard", "Course catalog", "Analytics UI"]
  },
  "mobile-developer": {
    title: "Mobile Specialization",
    description: "Build cross-platform apps with navigation, local storage, API data, and polished mobile UX.",
    skills: ["React Native", "Expo", "Navigation", "Local storage", "Mobile release workflow"],
    courses: ["Expo Docs", "React Native Fundamentals", "Mobile UI Patterns"],
    projects: ["Study planner", "Habit tracker", "Roadmap app"]
  },
  "cybersecurity-analyst": {
    title: "Cybersecurity Specialization",
    description: "Develop a practical foundation in networking, web security, threat analysis, and incident response.",
    skills: ["Networking", "Linux hardening", "OWASP Top 10", "Threat analysis", "Incident response"],
    courses: ["Google Cybersecurity Certificate", "OWASP WebGoat", "TryHackMe SOC Level 1"],
    projects: ["Security audit report", "Network monitoring lab", "OWASP test checklist"]
  },
  "cloud-engineer": {
    title: "Cloud Engineering Specialization",
    description: "Learn cloud services, networking, infrastructure as code, containers, and secure deployment.",
    skills: ["Cloud compute", "IAM", "VPC networking", "Terraform", "Monitoring"],
    courses: ["AWS Cloud Practitioner", "Terraform Associate", "Cloud Resume Challenge"],
    projects: ["Cloud-hosted API", "Serverless workflow", "IaC environment"]
  },
  "devops-engineer": {
    title: "DevOps Specialization",
    description: "Automate delivery with CI/CD, containers, infrastructure, observability, and release discipline.",
    skills: ["CI/CD", "Docker", "Kubernetes basics", "Infrastructure automation", "Observability"],
    courses: ["Docker Deep Dive", "Kubernetes Basics", "GitHub Actions CI/CD"],
    projects: ["Pipeline automation", "Containerized app", "Monitoring stack"]
  },
  "ui-ux-designer": {
    title: "Product Design Specialization",
    description: "Practice user research, flows, wireframes, design systems, prototypes, and usability testing.",
    skills: ["User research", "Wireframing", "Visual systems", "Prototyping", "Usability testing"],
    courses: ["Google UX Design", "Figma Academy", "Accessibility Fundamentals"],
    projects: ["Student portal redesign", "Mobile prototype", "Usability report"]
  }
};

export const buildRoadmapForCareer = (careerOrId: CareerPath | string): RoadmapPhase[] => {
  const career = typeof careerOrId === "string" ? getCareerById(careerOrId) : careerOrId;
  const specialization = specializationByCareer[career.id] || specializationByCareer["software-engineer"];

  const phases: RoadmapPhase[] = [
    {
      id: `${career.id}-fundamentals`,
      title: "Fundamentals",
      description: "Build the CS and productivity base every student needs before specialization.",
      detailedExplanation:
        "This phase focuses on computer science thinking, developer tools, problem decomposition, and study systems. It creates the base for every technical career path.",
      duration: "3-4 weeks",
      skills: [
        skill("cs-basics", "Computer science basics", "CS50 Introduction to Computer Science"),
        skill("git", "Git and GitHub workflow", "GitHub Skills"),
        skill("terminal", "Command line and developer setup", "Missing Semester"),
        skill("problem-solving", "Problem solving habits", "Problem Solving Patterns")
      ],
      courses: ["CS50 Introduction to Computer Science", "The Missing Semester", "GitHub Skills"],
      projects: ["Personal GitHub portfolio", "CLI notes manager", "Problem-solving journal"],
      progress: 0
    },
    {
      id: `${career.id}-programming-core`,
      title: "Programming Core",
      description: "Strengthen programming fluency with clean code, TypeScript or Python, and debugging.",
      detailedExplanation:
        "You will move beyond syntax into practical programming habits: functions, modules, data modeling, debugging, and readable code.",
      duration: "4-6 weeks",
      skills: [
        skill("language-core", "Core language syntax", "Python or TypeScript Essentials"),
        skill("oop", "Object-oriented programming", "OOP Design Basics"),
        skill("debugging", "Debugging and error handling", "Debugging Fundamentals"),
        skill("testing-basics", "Unit testing basics", "Testing for Beginners")
      ],
      courses: ["Python for Everybody", "TypeScript Handbook", "Testing JavaScript Basics"],
      projects: ["Grade calculator", "Course planner", "Unit-tested utility library"],
      progress: 0
    },
    {
      id: `${career.id}-dsa`,
      title: "Data Structures and Algorithms",
      description: "Practice the algorithms and data structures needed for interviews and solid engineering.",
      detailedExplanation:
        "This phase develops your ability to choose data structures, reason about complexity, and solve problems under constraints.",
      duration: "6-8 weeks",
      skills: [
        skill("arrays-strings", "Arrays and strings", "LeetCode Explore"),
        skill("hashing", "Hash maps and sets", "NeetCode Patterns"),
        skill("trees", "Trees and recursion", "Data Structures Course"),
        skill("graphs", "Graphs and search", "Graph Algorithms")
      ],
      courses: ["NeetCode Roadmap", "Grokking Algorithms", "Data Structures by UCSD"],
      projects: ["Algorithm visualizer", "Interview problem tracker", "Graph route finder"],
      progress: 0
    },
    {
      id: `${career.id}-databases`,
      title: "Databases",
      description: "Learn relational and document data modeling, querying, indexes, and data integrity.",
      detailedExplanation:
        "Databases are central to most career paths. You will learn how to model data, query efficiently, and understand tradeoffs.",
      duration: "4-5 weeks",
      skills: [
        skill("sql", "SQL querying", "SQLBolt"),
        skill("schema-design", "Schema design", "PostgreSQL Tutorial"),
        skill("indexes", "Indexes and query performance", "Database Performance Basics"),
        skill("nosql", "NoSQL fundamentals", "MongoDB University")
      ],
      courses: ["SQLBolt", "PostgreSQL Tutorial", "MongoDB University"],
      projects: ["Student records database", "Course recommendation schema", "Analytics queries notebook"],
      progress: 0
    },
    {
      id: `${career.id}-specialization`,
      title: specialization.title,
      description: specialization.description,
      detailedExplanation:
        "This phase adapts the roadmap to your selected path. The goal is to build the technical depth that makes your portfolio credible for this role.",
      duration: "8-10 weeks",
      skills: specialization.skills.map((item, index) => skill(`special-${index + 1}`, item, specialization.courses[index % specialization.courses.length])),
      courses: specialization.courses,
      projects: specialization.projects,
      progress: 0
    },
    {
      id: `${career.id}-projects`,
      title: "Projects",
      description: "Convert skills into portfolio proof through realistic, documented, deployable projects.",
      detailedExplanation:
        "Projects should demonstrate problem framing, architecture, implementation quality, and communication. Each project should have a README and demo.",
      duration: "6-8 weeks",
      skills: [
        skill("portfolio-project", "Build one flagship project", "Project Planning Guide"),
        skill("documentation", "Write professional documentation", "README Best Practices"),
        skill("deployment", "Deploy and monitor the project", "Deployment Fundamentals"),
        skill("case-study", "Prepare a case study", "Portfolio Case Study Guide")
      ],
      courses: ["Project-Based Learning", "README Best Practices", "Deployment Fundamentals"],
      projects: career.projects,
      progress: 0
    },
    {
      id: `${career.id}-interview-prep`,
      title: "Interview Preparation",
      description: "Prepare for applications, technical screens, behavioral interviews, and portfolio reviews.",
      detailedExplanation:
        "This phase turns your roadmap progress into job readiness with interview practice, resume positioning, and targeted applications.",
      duration: "4-6 weeks",
      skills: [
        skill("resume", "Role-focused resume", "Resume for CS Students"),
        skill("technical-interview", "Technical interview practice", "Interviewing.io Practice"),
        skill("behavioral", "Behavioral stories", "STAR Method Practice"),
        skill("portfolio-review", "Portfolio review and refinement", "Portfolio Checklist")
      ],
      courses: ["Tech Interview Handbook", "STAR Method Guide", "Portfolio Review Checklist"],
      projects: ["Resume refresh", "Mock interview log", "Portfolio walkthrough video"],
      progress: 0
    }
  ];

  return normalizeRoadmapProgress(phases);
};
