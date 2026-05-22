import { careers } from "./careers";
import type {
  CertificationItem,
  GitHubChecklistItem,
  InterviewTask,
  LearningResource,
  PlatformState,
  PortfolioProject,
  ReminderSettings,
  ResumeData,
  SkillTrackerItem,
  StudyPlan
} from "../types";

export const learningResources: LearningResource[] = [
  {
    id: "cs50",
    careerIds: careers.map((career) => career.id),
    title: "CS50 Introduction to Computer Science",
    provider: "Harvard",
    type: "Course",
    difficulty: "Beginner",
    description: "Strong foundation in computational thinking, algorithms, and practical programming.",
    url: "https://cs50.harvard.edu/x/"
  },
  {
    id: "missing-semester",
    careerIds: careers.map((career) => career.id),
    title: "The Missing Semester",
    provider: "MIT",
    type: "Course",
    difficulty: "Beginner",
    description: "Command line, Git, editors, debugging, and developer productivity tools.",
    url: "https://missing.csail.mit.edu/"
  },
  {
    id: "neetcode",
    careerIds: ["software-engineer", "backend-developer", "frontend-developer", "mobile-developer", "devops-engineer"],
    title: "NeetCode Roadmap",
    provider: "NeetCode",
    type: "Practice",
    difficulty: "Intermediate",
    description: "Structured coding interview practice with pattern-based problem solving.",
    url: "https://neetcode.io/roadmap"
  },
  {
    id: "huggingface",
    careerIds: ["ai-engineer", "machine-learning-engineer", "data-scientist"],
    title: "Hugging Face NLP Course",
    provider: "Hugging Face",
    type: "Documentation",
    difficulty: "Intermediate",
    description: "Transformer models, tokenization, fine-tuning, datasets, and applied NLP workflows.",
    url: "https://huggingface.co/learn/nlp-course"
  },
  {
    id: "fullstack-deep-learning",
    careerIds: ["ai-engineer", "machine-learning-engineer"],
    title: "Full Stack Deep Learning",
    provider: "FSDL",
    type: "Video",
    difficulty: "Advanced",
    description: "Production ML systems, deployment, evaluation, monitoring, and team workflows.",
    url: "https://fullstackdeeplearning.com/"
  },
  {
    id: "postgres",
    careerIds: ["backend-developer", "data-scientist", "software-engineer", "cloud-engineer"],
    title: "PostgreSQL Tutorial",
    provider: "PostgreSQL",
    type: "Documentation",
    difficulty: "Intermediate",
    description: "Schema design, SQL querying, indexing, transactions, and database performance.",
    url: "https://www.postgresql.org/docs/"
  },
  {
    id: "expo-docs",
    careerIds: ["mobile-developer"],
    title: "Expo Documentation",
    provider: "Expo",
    type: "Documentation",
    difficulty: "Beginner",
    description: "Navigation, native APIs, storage, builds, updates, and app release workflow.",
    url: "https://docs.expo.dev/"
  },
  {
    id: "owasp",
    careerIds: ["cybersecurity-analyst", "backend-developer", "cloud-engineer"],
    title: "OWASP Top 10",
    provider: "OWASP",
    type: "Article",
    difficulty: "Intermediate",
    description: "Common web security risks with mitigations and secure development practices.",
    url: "https://owasp.org/www-project-top-ten/"
  },
  {
    id: "terraform",
    careerIds: ["cloud-engineer", "devops-engineer"],
    title: "Terraform Associate Learning Path",
    provider: "HashiCorp",
    type: "Course",
    difficulty: "Intermediate",
    description: "Infrastructure as code, modules, state, providers, and cloud provisioning.",
    url: "https://developer.hashicorp.com/terraform/tutorials"
  },
  {
    id: "figma-academy",
    careerIds: ["ui-ux-designer", "frontend-developer", "mobile-developer"],
    title: "Figma Design Systems",
    provider: "Figma",
    type: "Video",
    difficulty: "Beginner",
    description: "Components, variants, design systems, prototyping, and collaboration workflows.",
    url: "https://help.figma.com/"
  }
];

export const createDefaultSkills = (careerId: string): SkillTrackerItem[] => {
  const career = careers.find((item) => item.id === careerId) || careers[0];
  return Array.from(new Set([...career.requiredSkills, ...career.technicalSkills])).slice(0, 10).map((title, index) => ({
    id: `${career.id}-skill-${index + 1}`,
    careerId: career.id,
    title,
    level: index < 3 ? "Beginner" : index < 7 ? "Intermediate" : "Advanced",
    status: "Not Started",
    progress: 0,
    resources: learningResources
      .filter((resource) => resource.careerIds.includes(career.id) || resource.careerIds.length === careers.length)
      .slice(0, 3)
      .map((resource) => resource.title)
  }));
};

export const createDefaultProjects = (careerId: string): PortfolioProject[] => {
  const career = careers.find((item) => item.id === careerId) || careers[0];
  return career.projects.map((title, index) => ({
    id: `${career.id}-project-${index + 1}`,
    careerId: career.id,
    title,
    description: `Portfolio-ready ${career.title.toLowerCase()} project focused on architecture, documentation, and measurable outcomes.`,
    difficulty: index === 0 ? "Beginner" : index === 1 ? "Intermediate" : "Advanced",
    skills: career.requiredSkills.slice(0, 4),
    completed: false,
    githubUrl: ""
  }));
};

export const createDefaultStudyPlan = (weeklyHours = 8, targetDate = ""): StudyPlan => ({
  weeklyHours,
  targetDate,
  tasks: [
    { id: "monday-focus", day: "Monday", title: "Review active roadmap phase and notes", phaseTitle: "Current phase", durationHours: 1.5, done: false },
    { id: "tuesday-skill", day: "Tuesday", title: "Complete one skill lesson and practice exercise", phaseTitle: "Skill tracker", durationHours: 2, done: false },
    { id: "thursday-project", day: "Thursday", title: "Build or document one portfolio project feature", phaseTitle: "Projects", durationHours: 2.5, done: false },
    { id: "saturday-review", day: "Saturday", title: "Interview practice and weekly progress review", phaseTitle: "Interview prep", durationHours: Math.max(2, weeklyHours - 6), done: false }
  ]
});

export const defaultResumeData: ResumeData = {
  education: "B.Sc. Computer Science, University / College, Expected Graduation Year",
  skills: "Python, TypeScript, SQL, Git, React Native, REST APIs",
  projects: "PathFinder graduation project - personalized career and learning roadmap platform",
  certifications: "CS50, Google UX/Cybersecurity/Data certificate, AWS Cloud Practitioner",
  experience: "Academic projects, internships, freelance work, open-source contributions"
};

export const createDefaultInterviews = (careerId: string): InterviewTask[] => [
  {
    id: `${careerId}-technical-1`,
    careerIds: [careerId],
    category: "Technical",
    prompt: "Explain one project architecture decision, tradeoff, and measurable result.",
    difficulty: "Intermediate",
    completed: false
  },
  {
    id: `${careerId}-technical-2`,
    careerIds: [careerId],
    category: "Technical",
    prompt: "Describe how you would debug a production issue in this career path.",
    difficulty: "Advanced",
    completed: false
  },
  {
    id: `${careerId}-behavioral-1`,
    careerIds: [careerId],
    category: "Behavioral",
    prompt: "Tell me about a time you learned a difficult technical concept quickly.",
    difficulty: "Beginner",
    completed: false
  },
  {
    id: `${careerId}-coding-1`,
    careerIds: [careerId],
    category: "Coding",
    prompt: "Solve a medium array/hash-map problem and explain complexity clearly.",
    difficulty: "Intermediate",
    completed: false
  }
];

export const createDefaultCertifications = (careerId: string): CertificationItem[] => {
  const common = [
    {
      id: `${careerId}-cert-github`,
      careerIds: [careerId],
      title: "GitHub Foundations",
      issuer: "GitHub",
      description: "Version control, collaboration, repositories, and professional project workflow.",
      status: "Planned" as const
    }
  ];
  const byCareer: Record<string, CertificationItem[]> = {
    "cloud-engineer": [
      {
        id: "aws-cloud-practitioner",
        careerIds: ["cloud-engineer", "devops-engineer"],
        title: "AWS Certified Cloud Practitioner",
        issuer: "AWS",
        description: "Cloud concepts, core AWS services, security, billing, and support.",
        status: "Planned"
      }
    ],
    "cybersecurity-analyst": [
      {
        id: "google-cybersecurity",
        careerIds: ["cybersecurity-analyst"],
        title: "Google Cybersecurity Certificate",
        issuer: "Google",
        description: "Security foundations, SIEM, Linux, SQL, incident response, and Python.",
        status: "Planned"
      }
    ],
    "data-scientist": [
      {
        id: "google-data-analytics",
        careerIds: ["data-scientist"],
        title: "Google Data Analytics Certificate",
        issuer: "Google",
        description: "Data cleaning, analysis, visualization, spreadsheets, SQL, and R basics.",
        status: "Planned"
      }
    ]
  };
  return [...(byCareer[careerId] || []), ...common];
};

export const defaultGithubChecklist: GitHubChecklistItem[] = [
  { id: "avatar-bio", title: "Professional profile photo and bio", description: "Clear student headline, target role, tech stack, and contact link.", completed: false },
  { id: "readmes", title: "README files for major projects", description: "Problem, features, architecture, setup, screenshots, and demo link.", completed: false },
  { id: "pinned-projects", title: "Pinned strongest projects", description: "Pin 3-6 projects that match your selected career path.", completed: false },
  { id: "deployed-links", title: "Deployed project links", description: "Add live demos, API docs, or recorded walkthroughs where possible.", completed: false },
  { id: "linkedin-link", title: "LinkedIn and portfolio links", description: "Connect GitHub, LinkedIn, resume, and personal site.", completed: false },
  { id: "clean-structure", title: "Clean project structure", description: "Consistent folders, meaningful commits, environment examples, and docs.", completed: false }
];

export const defaultReminders: ReminderSettings = {
  weeklyGoalReminders: true,
  roadmapDeadlineReminders: true,
  studyStreakReminders: true,
  preferredDay: "Saturday",
  preferredTime: "7:00 PM"
};

export const createDefaultPlatformState = (careerId: string, weeklyHours = 8): PlatformState => ({
  skills: createDefaultSkills(careerId),
  projects: createDefaultProjects(careerId),
  studyPlan: createDefaultStudyPlan(weeklyHours),
  resume: defaultResumeData,
  interviewTasks: createDefaultInterviews(careerId),
  certifications: createDefaultCertifications(careerId),
  githubChecklist: defaultGithubChecklist,
  reminders: defaultReminders,
  updatedAt: new Date().toISOString()
});
