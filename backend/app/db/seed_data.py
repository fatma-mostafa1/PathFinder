import asyncio
from typing import Any

from bson import ObjectId
from pymongo import UpdateOne

from app.db.mongodb import close_mongo_connection, connect_to_mongo, get_database
from app.models.career_model import create_career_path_document
from app.models.certification_model import create_certification_document
from app.models.interview_model import create_interview_question_document
from app.models.project_model import create_project_document
from app.models.roadmap_model import create_roadmap_document
from app.models.skill_model import create_skill_document
from app.utils.helpers import slugify, utc_now


CAREER_SEEDS: list[dict[str, Any]] = [
    {
        "title": "AI Engineer",
        "description": "Build intelligent systems using machine learning, deep learning, and applied AI techniques.",
        "overview": "AI Engineers design, train, evaluate, and deploy AI-powered software products.",
        "difficulty_level": "advanced",
        "average_duration_months": 10,
        "required_skills": ["Python", "Algorithms", "Machine Learning", "Deep Learning", "FastAPI", "MongoDB"],
        "recommended_tools": ["Python", "PyTorch", "TensorFlow", "FastAPI", "Docker", "MongoDB"],
        "responsibilities": ["Design AI features", "Train models", "Evaluate model quality", "Deploy inference APIs"],
        "market_demand": "very_high",
        "salary_level": "very_high",
        "tags": ["ai", "machine learning", "deep learning", "python"],
        "icon": "brain",
        "color": "#4F46E5",
        "roadmap_phases": [
            {"title": "Programming and Math", "skills": ["Python", "Algorithms", "Linear Algebra"], "projects": ["AI Math Notebook"], "estimated_weeks": 4},
            {"title": "Machine Learning Core", "skills": ["Machine Learning", "SQL"], "projects": ["Model Evaluation Dashboard"], "estimated_weeks": 6},
            {"title": "Deep Learning and Deployment", "skills": ["Deep Learning", "FastAPI", "MongoDB"], "projects": ["AI Career Assistant API"], "estimated_weeks": 8},
        ],
        "learning_resources": [
            {"title": "Deep Learning Specialization", "provider": "Coursera", "type": "course", "url": "https://www.coursera.org/specializations/deep-learning", "difficulty": "advanced", "estimated_hours": 80, "is_free": False},
            {"title": "PyTorch Tutorials", "provider": "PyTorch", "type": "documentation", "url": "https://pytorch.org/tutorials/", "difficulty": "intermediate", "estimated_hours": 20, "is_free": True},
        ],
        "suggested_projects": ["AI Math Notebook", "Model Evaluation Dashboard", "AI Career Assistant API"],
        "recommended_certifications": ["Microsoft Azure AI Engineer Associate", "TensorFlow Developer Certificate"],
        "interview_questions": [
            {"question": "How do you evaluate a classification model?", "answer": "Use metrics such as precision, recall, F1 score, ROC-AUC, and confusion matrices depending on class balance and business cost.", "type": "technical", "difficulty": "intermediate", "related_skill": "Machine Learning"},
            {"question": "Explain overfitting and how to reduce it.", "answer": "Overfitting happens when a model memorizes training data. Regularization, more data, dropout, augmentation, and validation help reduce it.", "type": "technical", "difficulty": "beginner", "related_skill": "Deep Learning"},
        ],
        "certifications": [
            {"title": "Microsoft Azure AI Engineer Associate", "provider": "Microsoft", "description": "Cloud AI engineering certification.", "difficulty": "intermediate", "url": "https://learn.microsoft.com/credentials/certifications/azure-ai-engineer/", "estimated_duration": "8 weeks", "cost_type": "paid"},
            {"title": "TensorFlow Developer Certificate", "provider": "Google TensorFlow", "description": "TensorFlow model building credential.", "difficulty": "intermediate", "url": "https://www.tensorflow.org/certificate", "estimated_duration": "6 weeks", "cost_type": "paid"},
        ],
    },
    {
        "title": "Machine Learning Engineer",
        "description": "Create production ML systems, pipelines, and model-serving infrastructure.",
        "overview": "ML Engineers bridge data science experimentation and reliable production systems.",
        "difficulty_level": "advanced",
        "average_duration_months": 9,
        "required_skills": ["Python", "Machine Learning", "SQL", "Data Structures", "Algorithms", "Cloud Basics"],
        "recommended_tools": ["Scikit-learn", "MLflow", "Docker", "Kubernetes", "FastAPI"],
        "responsibilities": ["Build ML pipelines", "Serve models", "Monitor drift", "Collaborate with data teams"],
        "market_demand": "very_high",
        "salary_level": "very_high",
        "tags": ["mlops", "models", "pipelines", "python"],
        "icon": "network",
        "color": "#0891B2",
        "roadmap_phases": [
            {"title": "ML Foundations", "skills": ["Python", "SQL", "Machine Learning"], "projects": ["Customer Churn Predictor"], "estimated_weeks": 6},
            {"title": "Software for ML", "skills": ["Data Structures", "FastAPI", "Docker"], "projects": ["Model Serving API"], "estimated_weeks": 5},
            {"title": "MLOps", "skills": ["Cloud Basics", "Algorithms"], "projects": ["ML Pipeline with Monitoring"], "estimated_weeks": 7},
        ],
        "learning_resources": [
            {"title": "Machine Learning Engineering for Production", "provider": "Coursera", "type": "course", "url": "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops", "difficulty": "advanced", "estimated_hours": 70, "is_free": False},
            {"title": "Scikit-learn User Guide", "provider": "Scikit-learn", "type": "documentation", "url": "https://scikit-learn.org/stable/user_guide.html", "difficulty": "intermediate", "estimated_hours": 25, "is_free": True},
        ],
        "suggested_projects": ["Customer Churn Predictor", "Model Serving API", "ML Pipeline with Monitoring"],
        "recommended_certifications": ["Google Professional Machine Learning Engineer"],
        "interview_questions": [
            {"question": "What is data leakage?", "answer": "Data leakage occurs when training data includes information unavailable at prediction time, producing misleading performance.", "type": "technical", "difficulty": "intermediate", "related_skill": "Machine Learning"},
            {"question": "How would you deploy a model as an API?", "answer": "Package the model, create an inference service, validate inputs, add monitoring, containerize, and deploy behind secure infrastructure.", "type": "technical", "difficulty": "advanced", "related_skill": "FastAPI"},
        ],
        "certifications": [
            {"title": "Google Professional Machine Learning Engineer", "provider": "Google Cloud", "description": "Production ML on Google Cloud.", "difficulty": "advanced", "url": "https://cloud.google.com/learn/certification/machine-learning-engineer", "estimated_duration": "10 weeks", "cost_type": "paid"},
        ],
    },
    {
        "title": "Data Scientist",
        "description": "Analyze data, build models, and communicate insights for decision-making.",
        "overview": "Data Scientists combine statistics, programming, and storytelling.",
        "difficulty_level": "intermediate",
        "average_duration_months": 7,
        "required_skills": ["Python", "SQL", "Statistics", "Machine Learning", "Data Visualization"],
        "recommended_tools": ["Python", "Pandas", "Jupyter", "Tableau", "Power BI"],
        "responsibilities": ["Clean data", "Run experiments", "Create dashboards", "Explain insights"],
        "market_demand": "high",
        "salary_level": "high",
        "tags": ["data", "analytics", "statistics", "visualization"],
        "icon": "bar-chart",
        "color": "#16A34A",
        "roadmap_phases": [
            {"title": "Data Analysis", "skills": ["Python", "SQL", "Statistics"], "projects": ["Student Performance Analysis"], "estimated_weeks": 5},
            {"title": "Visualization and Storytelling", "skills": ["Data Visualization"], "projects": ["Career Insights Dashboard"], "estimated_weeks": 4},
            {"title": "Applied ML", "skills": ["Machine Learning"], "projects": ["Graduation Outcome Predictor"], "estimated_weeks": 6},
        ],
        "learning_resources": [
            {"title": "Kaggle Learn", "provider": "Kaggle", "type": "platform", "url": "https://www.kaggle.com/learn", "difficulty": "beginner", "estimated_hours": 30, "is_free": True},
            {"title": "Python Data Science Handbook", "provider": "O'Reilly", "type": "book", "url": "https://jakevdp.github.io/PythonDataScienceHandbook/", "difficulty": "intermediate", "estimated_hours": 45, "is_free": True},
        ],
        "suggested_projects": ["Student Performance Analysis", "Career Insights Dashboard", "Graduation Outcome Predictor"],
        "recommended_certifications": ["IBM Data Science Professional Certificate"],
        "interview_questions": [
            {"question": "How do you handle missing values?", "answer": "Analyze missingness, choose deletion or imputation based on context, and validate the impact on downstream analysis.", "type": "technical", "difficulty": "beginner", "related_skill": "Statistics"},
            {"question": "How would you explain a model to a non-technical stakeholder?", "answer": "Connect model behavior to business outcomes, use simple visuals, and explain uncertainty and limitations.", "type": "behavioral", "difficulty": "intermediate", "related_skill": "Data Visualization"},
        ],
        "certifications": [
            {"title": "IBM Data Science Professional Certificate", "provider": "IBM", "description": "Foundational data science credential.", "difficulty": "beginner", "url": "https://www.coursera.org/professional-certificates/ibm-data-science", "estimated_duration": "12 weeks", "cost_type": "paid"},
        ],
    },
    {
        "title": "Backend Developer",
        "description": "Design secure APIs, databases, services, and server-side application architecture.",
        "overview": "Backend Developers build the systems that power web and mobile applications.",
        "difficulty_level": "intermediate",
        "average_duration_months": 6,
        "required_skills": ["Python", "FastAPI", "MongoDB", "SQL", "Data Structures", "Algorithms"],
        "recommended_tools": ["FastAPI", "MongoDB", "PostgreSQL", "Docker", "Redis"],
        "responsibilities": ["Build APIs", "Design databases", "Secure authentication", "Optimize performance"],
        "market_demand": "very_high",
        "salary_level": "high",
        "tags": ["api", "database", "server", "python"],
        "icon": "server",
        "color": "#2563EB",
        "roadmap_phases": [
            {"title": "Programming Core", "skills": ["Python", "Data Structures", "Algorithms"], "projects": ["REST API Exercises"], "estimated_weeks": 4},
            {"title": "API and Database", "skills": ["FastAPI", "MongoDB", "SQL"], "projects": ["Task Manager API"], "estimated_weeks": 6},
            {"title": "Production Backend", "skills": ["Docker", "Authentication", "Testing"], "projects": ["Career Platform Backend"], "estimated_weeks": 6},
        ],
        "learning_resources": [
            {"title": "FastAPI Documentation", "provider": "FastAPI", "type": "documentation", "url": "https://fastapi.tiangolo.com/", "difficulty": "intermediate", "estimated_hours": 25, "is_free": True},
            {"title": "MongoDB University", "provider": "MongoDB", "type": "platform", "url": "https://learn.mongodb.com/", "difficulty": "beginner", "estimated_hours": 30, "is_free": True},
        ],
        "suggested_projects": ["REST API Exercises", "Task Manager API", "Career Platform Backend"],
        "recommended_certifications": ["MongoDB Associate Developer", "AWS Certified Developer Associate"],
        "interview_questions": [
            {"question": "What makes an API RESTful?", "answer": "Resource-oriented URLs, HTTP methods, stateless requests, consistent status codes, and predictable representations.", "type": "technical", "difficulty": "beginner", "related_skill": "FastAPI"},
            {"question": "How do you secure JWT authentication?", "answer": "Use strong secrets, short expirations, HTTPS, proper validation, least-privilege claims, and careful token storage.", "type": "technical", "difficulty": "intermediate", "related_skill": "Authentication"},
        ],
        "certifications": [
            {"title": "MongoDB Associate Developer", "provider": "MongoDB", "description": "Developer certification for MongoDB applications.", "difficulty": "intermediate", "url": "https://www.mongodb.com/products/certification/developer", "estimated_duration": "6 weeks", "cost_type": "paid"},
            {"title": "AWS Certified Developer Associate", "provider": "AWS", "description": "Cloud developer certification.", "difficulty": "intermediate", "url": "https://aws.amazon.com/certification/certified-developer-associate/", "estimated_duration": "10 weeks", "cost_type": "paid"},
        ],
    },
    {
        "title": "Frontend Developer",
        "description": "Build accessible, responsive, and high-quality user interfaces.",
        "overview": "Frontend Developers translate product and design ideas into interactive applications.",
        "difficulty_level": "intermediate",
        "average_duration_months": 5,
        "required_skills": ["JavaScript", "React", "HTML", "CSS", "UI Basics", "Testing"],
        "recommended_tools": ["React", "TypeScript", "Vite", "Tailwind CSS", "Jest"],
        "responsibilities": ["Build UI components", "Connect APIs", "Improve accessibility", "Optimize performance"],
        "market_demand": "high",
        "salary_level": "high",
        "tags": ["web", "react", "ui", "javascript"],
        "icon": "layout",
        "color": "#EA580C",
        "roadmap_phases": [
            {"title": "Web Foundations", "skills": ["HTML", "CSS", "JavaScript"], "projects": ["Responsive Portfolio"], "estimated_weeks": 4},
            {"title": "React Applications", "skills": ["React", "TypeScript"], "projects": ["Career Explorer UI"], "estimated_weeks": 5},
            {"title": "Professional Frontend", "skills": ["Testing", "Accessibility"], "projects": ["Roadmap Dashboard"], "estimated_weeks": 5},
        ],
        "learning_resources": [
            {"title": "React Docs", "provider": "React", "type": "documentation", "url": "https://react.dev/learn", "difficulty": "beginner", "estimated_hours": 20, "is_free": True},
            {"title": "MDN Web Docs", "provider": "Mozilla", "type": "documentation", "url": "https://developer.mozilla.org/", "difficulty": "beginner", "estimated_hours": 40, "is_free": True},
        ],
        "suggested_projects": ["Responsive Portfolio", "Career Explorer UI", "Roadmap Dashboard"],
        "recommended_certifications": ["Meta Front-End Developer Professional Certificate"],
        "interview_questions": [
            {"question": "What is component state?", "answer": "State is data owned by a component that can change over time and trigger UI re-rendering.", "type": "technical", "difficulty": "beginner", "related_skill": "React"},
            {"question": "How do you improve web accessibility?", "answer": "Use semantic HTML, keyboard navigation, sufficient contrast, labels, focus states, and screen-reader testing.", "type": "technical", "difficulty": "intermediate", "related_skill": "Accessibility"},
        ],
        "certifications": [
            {"title": "Meta Front-End Developer Professional Certificate", "provider": "Meta", "description": "Frontend development credential.", "difficulty": "beginner", "url": "https://www.coursera.org/professional-certificates/meta-front-end-developer", "estimated_duration": "16 weeks", "cost_type": "paid"},
        ],
    },
    {
        "title": "Mobile App Developer",
        "description": "Build mobile applications for Android, iOS, and cross-platform ecosystems.",
        "overview": "Mobile Developers create performant app experiences backed by APIs and device features.",
        "difficulty_level": "intermediate",
        "average_duration_months": 6,
        "required_skills": ["JavaScript", "React Native", "Mobile UI", "APIs", "Data Structures"],
        "recommended_tools": ["React Native", "Expo", "Android Studio", "Firebase"],
        "responsibilities": ["Build mobile screens", "Integrate APIs", "Manage app state", "Publish releases"],
        "market_demand": "high",
        "salary_level": "high",
        "tags": ["mobile", "android", "ios", "react native"],
        "icon": "smartphone",
        "color": "#DB2777",
        "roadmap_phases": [
            {"title": "Mobile Foundations", "skills": ["JavaScript", "Mobile UI"], "projects": ["Habit Tracker App"], "estimated_weeks": 4},
            {"title": "React Native", "skills": ["React Native", "APIs"], "projects": ["Career Roadmap Mobile App"], "estimated_weeks": 6},
            {"title": "Release Readiness", "skills": ["Testing", "Firebase"], "projects": ["Offline Study Planner"], "estimated_weeks": 5},
        ],
        "learning_resources": [
            {"title": "Expo Documentation", "provider": "Expo", "type": "documentation", "url": "https://docs.expo.dev/", "difficulty": "beginner", "estimated_hours": 18, "is_free": True},
            {"title": "React Native Docs", "provider": "Meta", "type": "documentation", "url": "https://reactnative.dev/docs/getting-started", "difficulty": "intermediate", "estimated_hours": 25, "is_free": True},
        ],
        "suggested_projects": ["Habit Tracker App", "Career Roadmap Mobile App", "Offline Study Planner"],
        "recommended_certifications": ["Meta React Native Specialization"],
        "interview_questions": [
            {"question": "How does mobile state management differ from web state management?", "answer": "Mobile state often considers offline behavior, navigation lifecycle, device storage, and lower resource budgets.", "type": "technical", "difficulty": "intermediate", "related_skill": "React Native"},
            {"question": "What are common performance issues in mobile apps?", "answer": "Large renders, unoptimized images, heavy bridge traffic, slow network calls, and memory leaks.", "type": "technical", "difficulty": "intermediate", "related_skill": "Mobile UI"},
        ],
        "certifications": [
            {"title": "Meta React Native Specialization", "provider": "Meta", "description": "Cross-platform app development specialization.", "difficulty": "intermediate", "url": "https://www.coursera.org/specializations/meta-react-native", "estimated_duration": "12 weeks", "cost_type": "paid"},
        ],
    },
    {
        "title": "Cybersecurity Analyst",
        "description": "Protect systems by detecting threats, assessing risk, and responding to incidents.",
        "overview": "Cybersecurity Analysts combine networking, systems, and security investigation skills.",
        "difficulty_level": "intermediate",
        "average_duration_months": 7,
        "required_skills": ["Cybersecurity Basics", "Networking", "Linux", "Python", "Security Monitoring"],
        "recommended_tools": ["Wireshark", "Nmap", "Linux", "Splunk", "Burp Suite"],
        "responsibilities": ["Monitor alerts", "Analyze threats", "Harden systems", "Document incidents"],
        "market_demand": "very_high",
        "salary_level": "high",
        "tags": ["security", "networking", "soc", "linux"],
        "icon": "shield",
        "color": "#DC2626",
        "roadmap_phases": [
            {"title": "Security Foundations", "skills": ["Cybersecurity Basics", "Networking", "Linux"], "projects": ["Home Security Lab"], "estimated_weeks": 5},
            {"title": "Detection and Analysis", "skills": ["Security Monitoring", "Python"], "projects": ["Log Analysis Toolkit"], "estimated_weeks": 5},
            {"title": "Incident Response", "skills": ["Threat Modeling", "Documentation"], "projects": ["Incident Response Report"], "estimated_weeks": 4},
        ],
        "learning_resources": [
            {"title": "TryHackMe Pre Security", "provider": "TryHackMe", "type": "platform", "url": "https://tryhackme.com/path/outline/presecurity", "difficulty": "beginner", "estimated_hours": 30, "is_free": False},
            {"title": "OWASP Top Ten", "provider": "OWASP", "type": "documentation", "url": "https://owasp.org/www-project-top-ten/", "difficulty": "beginner", "estimated_hours": 12, "is_free": True},
        ],
        "suggested_projects": ["Home Security Lab", "Log Analysis Toolkit", "Incident Response Report"],
        "recommended_certifications": ["CompTIA Security+", "Google Cybersecurity Professional Certificate"],
        "interview_questions": [
            {"question": "What is the CIA triad?", "answer": "Confidentiality, integrity, and availability are core security goals for protecting systems and data.", "type": "technical", "difficulty": "beginner", "related_skill": "Cybersecurity Basics"},
            {"question": "How would you respond to a suspicious login alert?", "answer": "Validate the alert, inspect logs and context, contain affected accounts, escalate if needed, and document findings.", "type": "behavioral", "difficulty": "intermediate", "related_skill": "Security Monitoring"},
        ],
        "certifications": [
            {"title": "CompTIA Security+", "provider": "CompTIA", "description": "Entry-level security certification.", "difficulty": "intermediate", "url": "https://www.comptia.org/certifications/security", "estimated_duration": "10 weeks", "cost_type": "paid"},
            {"title": "Google Cybersecurity Professional Certificate", "provider": "Google", "description": "Beginner cybersecurity certificate.", "difficulty": "beginner", "url": "https://www.coursera.org/professional-certificates/google-cybersecurity", "estimated_duration": "12 weeks", "cost_type": "paid"},
        ],
    },
    {
        "title": "Cloud Engineer",
        "description": "Design, deploy, and operate scalable cloud infrastructure and services.",
        "overview": "Cloud Engineers manage compute, storage, networking, security, and automation in cloud platforms.",
        "difficulty_level": "intermediate",
        "average_duration_months": 7,
        "required_skills": ["Cloud Basics", "Linux", "Networking", "Docker", "Python"],
        "recommended_tools": ["AWS", "Azure", "Terraform", "Docker", "Linux"],
        "responsibilities": ["Provision infrastructure", "Configure networks", "Automate deployments", "Control cloud costs"],
        "market_demand": "very_high",
        "salary_level": "high",
        "tags": ["cloud", "aws", "azure", "infrastructure"],
        "icon": "cloud",
        "color": "#0284C7",
        "roadmap_phases": [
            {"title": "Cloud Fundamentals", "skills": ["Cloud Basics", "Networking"], "projects": ["Static Site on Cloud"], "estimated_weeks": 4},
            {"title": "Infrastructure and Containers", "skills": ["Linux", "Docker"], "projects": ["Containerized API Deployment"], "estimated_weeks": 5},
            {"title": "Automation", "skills": ["Terraform", "Python"], "projects": ["Infrastructure as Code Lab"], "estimated_weeks": 5},
        ],
        "learning_resources": [
            {"title": "AWS Skill Builder", "provider": "AWS", "type": "platform", "url": "https://skillbuilder.aws/", "difficulty": "beginner", "estimated_hours": 35, "is_free": True},
            {"title": "Microsoft Learn Azure", "provider": "Microsoft", "type": "platform", "url": "https://learn.microsoft.com/azure/", "difficulty": "beginner", "estimated_hours": 35, "is_free": True},
        ],
        "suggested_projects": ["Static Site on Cloud", "Containerized API Deployment", "Infrastructure as Code Lab"],
        "recommended_certifications": ["AWS Certified Cloud Practitioner", "Microsoft Azure Fundamentals"],
        "interview_questions": [
            {"question": "What is the difference between IaaS, PaaS, and SaaS?", "answer": "They represent different responsibility levels: infrastructure, managed platforms, and complete software services.", "type": "technical", "difficulty": "beginner", "related_skill": "Cloud Basics"},
            {"question": "How do you make a cloud deployment more reliable?", "answer": "Use multiple zones, health checks, autoscaling, backups, monitoring, and automated rollback strategies.", "type": "technical", "difficulty": "intermediate", "related_skill": "Cloud Basics"},
        ],
        "certifications": [
            {"title": "AWS Certified Cloud Practitioner", "provider": "AWS", "description": "Cloud fundamentals certification.", "difficulty": "beginner", "url": "https://aws.amazon.com/certification/certified-cloud-practitioner/", "estimated_duration": "6 weeks", "cost_type": "paid"},
            {"title": "Microsoft Azure Fundamentals", "provider": "Microsoft", "description": "Azure fundamentals certification.", "difficulty": "beginner", "url": "https://learn.microsoft.com/credentials/certifications/azure-fundamentals/", "estimated_duration": "4 weeks", "cost_type": "paid"},
        ],
    },
    {
        "title": "DevOps Engineer",
        "description": "Automate delivery pipelines, infrastructure, observability, and operational workflows.",
        "overview": "DevOps Engineers help teams release reliable software faster.",
        "difficulty_level": "advanced",
        "average_duration_months": 8,
        "required_skills": ["Linux", "Docker", "CI/CD", "Cloud Basics", "Monitoring", "Scripting"],
        "recommended_tools": ["Docker", "GitHub Actions", "Kubernetes", "Terraform", "Prometheus"],
        "responsibilities": ["Create pipelines", "Manage infrastructure", "Monitor systems", "Improve reliability"],
        "market_demand": "very_high",
        "salary_level": "very_high",
        "tags": ["devops", "automation", "cicd", "kubernetes"],
        "icon": "workflow",
        "color": "#7C3AED",
        "roadmap_phases": [
            {"title": "Systems and Containers", "skills": ["Linux", "Docker", "Scripting"], "projects": ["Dockerized Backend Stack"], "estimated_weeks": 5},
            {"title": "CI/CD", "skills": ["CI/CD", "Testing"], "projects": ["Automated Deployment Pipeline"], "estimated_weeks": 5},
            {"title": "Reliability", "skills": ["Monitoring", "Cloud Basics"], "projects": ["Observability Dashboard"], "estimated_weeks": 6},
        ],
        "learning_resources": [
            {"title": "Docker Docs", "provider": "Docker", "type": "documentation", "url": "https://docs.docker.com/", "difficulty": "beginner", "estimated_hours": 20, "is_free": True},
            {"title": "Kubernetes Basics", "provider": "Kubernetes", "type": "documentation", "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/", "difficulty": "intermediate", "estimated_hours": 20, "is_free": True},
        ],
        "suggested_projects": ["Dockerized Backend Stack", "Automated Deployment Pipeline", "Observability Dashboard"],
        "recommended_certifications": ["Docker Certified Associate", "Certified Kubernetes Application Developer"],
        "interview_questions": [
            {"question": "What is CI/CD?", "answer": "Continuous integration and continuous delivery automate testing, building, and deploying software changes.", "type": "technical", "difficulty": "beginner", "related_skill": "CI/CD"},
            {"question": "How do containers help deployment?", "answer": "Containers package applications with dependencies for consistent runtime behavior across environments.", "type": "technical", "difficulty": "beginner", "related_skill": "Docker"},
        ],
        "certifications": [
            {"title": "Docker Certified Associate", "provider": "Docker", "description": "Containerization certification.", "difficulty": "intermediate", "url": "https://training.mirantis.com/certification/dca-certification-exam/", "estimated_duration": "8 weeks", "cost_type": "paid"},
            {"title": "Certified Kubernetes Application Developer", "provider": "CNCF", "description": "Kubernetes application certification.", "difficulty": "advanced", "url": "https://www.cncf.io/training/certification/ckad/", "estimated_duration": "10 weeks", "cost_type": "paid"},
        ],
    },
    {
        "title": "UI/UX Designer",
        "description": "Research users, design product experiences, prototype interfaces, and improve usability.",
        "overview": "UI/UX Designers connect user needs with accessible, polished digital product design.",
        "difficulty_level": "beginner",
        "average_duration_months": 5,
        "required_skills": ["UI Basics", "UX Research", "Wireframing", "Prototyping", "Accessibility"],
        "recommended_tools": ["Figma", "FigJam", "Notion", "Miro"],
        "responsibilities": ["Conduct research", "Create wireframes", "Prototype flows", "Validate usability"],
        "market_demand": "high",
        "salary_level": "medium",
        "tags": ["design", "ux", "ui", "figma"],
        "icon": "pen-tool",
        "color": "#9333EA",
        "roadmap_phases": [
            {"title": "Design Foundations", "skills": ["UI Basics", "Accessibility"], "projects": ["Design System Basics"], "estimated_weeks": 4},
            {"title": "UX Process", "skills": ["UX Research", "Wireframing"], "projects": ["Student Journey Research"], "estimated_weeks": 5},
            {"title": "Portfolio Case Study", "skills": ["Prototyping"], "projects": ["Career App Prototype"], "estimated_weeks": 5},
        ],
        "learning_resources": [
            {"title": "Figma Learn", "provider": "Figma", "type": "platform", "url": "https://www.figma.com/resource-library/design-basics/", "difficulty": "beginner", "estimated_hours": 20, "is_free": True},
            {"title": "Nielsen Norman Group Articles", "provider": "NN/g", "type": "article", "url": "https://www.nngroup.com/articles/", "difficulty": "intermediate", "estimated_hours": 25, "is_free": True},
        ],
        "suggested_projects": ["Design System Basics", "Student Journey Research", "Career App Prototype"],
        "recommended_certifications": ["Google UX Design Professional Certificate"],
        "interview_questions": [
            {"question": "How do you validate a design decision?", "answer": "Use research, usability testing, product metrics, accessibility checks, and stakeholder constraints.", "type": "behavioral", "difficulty": "intermediate", "related_skill": "UX Research"},
            {"question": "What makes a good design portfolio case study?", "answer": "Clear problem framing, process, constraints, decisions, iterations, outcomes, and reflection.", "type": "behavioral", "difficulty": "beginner", "related_skill": "Prototyping"},
        ],
        "certifications": [
            {"title": "Google UX Design Professional Certificate", "provider": "Google", "description": "UX design foundations and portfolio certificate.", "difficulty": "beginner", "url": "https://www.coursera.org/professional-certificates/google-ux-design", "estimated_duration": "16 weeks", "cost_type": "paid"},
        ],
    },
]


BASE_SKILLS = [
    ("Python", "programming", "General-purpose language for backend, automation, data, and AI."),
    ("JavaScript", "programming", "Language of the web and many cross-platform applications."),
    ("SQL", "database", "Query language for relational databases and analytics."),
    ("Data Structures", "computer science", "Core structures such as arrays, lists, stacks, queues, trees, and graphs."),
    ("Algorithms", "computer science", "Problem-solving patterns, complexity, and algorithm design."),
    ("React", "frontend", "Component-based frontend library."),
    ("FastAPI", "backend", "Modern Python API framework."),
    ("MongoDB", "database", "Document database for flexible application data."),
    ("Machine Learning", "ai", "Learning patterns from data to make predictions."),
    ("Cybersecurity Basics", "security", "Security principles, common threats, and defensive fundamentals."),
    ("Deep Learning", "ai", "Neural network modeling for complex AI tasks."),
    ("Statistics", "data", "Probability, inference, experiments, and data reasoning."),
    ("Data Visualization", "data", "Communicating insights through charts and dashboards."),
    ("HTML", "frontend", "Semantic markup for web documents."),
    ("CSS", "frontend", "Styling and responsive layout for the web."),
    ("TypeScript", "frontend", "Typed JavaScript for larger applications."),
    ("React Native", "mobile", "Cross-platform mobile app framework."),
    ("Mobile UI", "mobile", "Usable interface patterns for mobile devices."),
    ("APIs", "backend", "Contracts for application integration."),
    ("Networking", "security", "Protocols, ports, routing, and network troubleshooting."),
    ("Linux", "systems", "Operating system skills for development and infrastructure."),
    ("Security Monitoring", "security", "Detecting and investigating suspicious activity."),
    ("Cloud Basics", "cloud", "Core cloud compute, storage, networking, and identity services."),
    ("Docker", "devops", "Containerizing and running applications consistently."),
    ("CI/CD", "devops", "Automated build, test, and deployment workflows."),
    ("Monitoring", "devops", "Observability through logs, metrics, and alerts."),
    ("Scripting", "devops", "Automation using shell or Python scripts."),
    ("UI Basics", "design", "Layout, hierarchy, typography, and color fundamentals."),
    ("UX Research", "design", "Understanding users through interviews, surveys, and testing."),
    ("Wireframing", "design", "Low-fidelity structure and flow design."),
    ("Prototyping", "design", "Interactive design exploration and validation."),
    ("Accessibility", "design", "Inclusive design for people with different abilities."),
    ("Linear Algebra", "math", "Vectors, matrices, and math used in AI."),
    ("Testing", "quality", "Verifying behavior with automated and manual tests."),
    ("Authentication", "security", "Identity, sessions, tokens, and access control."),
    ("Terraform", "cloud", "Infrastructure as code."),
    ("Firebase", "mobile", "Backend platform for mobile app development."),
    ("Threat Modeling", "security", "Identifying security risks in systems."),
    ("Documentation", "professional", "Clear technical writing and project communication."),
]


async def _seed_skills(db) -> None:
    operations = []
    for name, category, description in BASE_SKILLS:
        operations.append(
            UpdateOne(
                {"name": name},
                {"$set": create_skill_document({"name": name, "category": category, "description": description})},
                upsert=True,
            )
        )
    if operations:
        await db.skills.bulk_write(operations)


async def _upsert_career(db, career_seed: dict[str, Any]) -> ObjectId:
    career_payload = {**career_seed, "slug": slugify(career_seed["title"])}
    career_payload.pop("roadmap_phases", None)
    career_payload.pop("learning_resources", None)
    career_payload.pop("interview_questions", None)
    career_payload.pop("certifications", None)
    document = create_career_path_document(career_payload)
    await db.career_paths.update_one({"slug": document["slug"]}, {"$set": document}, upsert=True)
    career = await db.career_paths.find_one({"slug": document["slug"]})
    return career["_id"]


async def _seed_roadmap(db, career_seed: dict[str, Any], career_id: ObjectId) -> None:
    phases = []
    for index, phase in enumerate(career_seed["roadmap_phases"], start=1):
        phases.append(
            {
                "phase_id": f"{slugify(career_seed['title'])}-phase-{index}",
                "title": phase["title"],
                "description": f"Build competence in {phase['title'].lower()} for {career_seed['title']}.",
                "order": index,
                "estimated_weeks": phase["estimated_weeks"],
                "skills": phase["skills"],
                "resources": [resource["title"] for resource in career_seed["learning_resources"]],
                "projects": phase["projects"],
                "is_required": True,
            }
        )
    roadmap_doc = create_roadmap_document(
        {
            "career_path_id": career_id,
            "title": f"{career_seed['title']} Roadmap",
            "description": f"Structured learning roadmap for becoming a {career_seed['title']}.",
            "total_estimated_weeks": sum(phase["estimated_weeks"] for phase in career_seed["roadmap_phases"]),
            "phases": phases,
        }
    )
    await db.roadmaps.update_one({"career_path_id": career_id}, {"$set": roadmap_doc}, upsert=True)


async def _seed_resources(db, career_seed: dict[str, Any], career_id: ObjectId) -> None:
    for resource in career_seed["learning_resources"]:
        now = utc_now()
        document = {
            "title": resource["title"],
            "description": f"Recommended resource for {career_seed['title']}.",
            "type": resource["type"],
            "url": resource["url"],
            "provider": resource["provider"],
            "difficulty": resource["difficulty"],
            "related_skills": career_seed["required_skills"],
            "related_careers": [career_id],
            "estimated_hours": resource["estimated_hours"],
            "is_free": resource["is_free"],
            "rating": 4.6,
            "updated_at": now,
        }
        await db.learning_resources.update_one(
            {"title": document["title"], "provider": document["provider"]},
            {"$set": document, "$setOnInsert": {"created_at": now}},
            upsert=True,
        )


async def _seed_projects(db, career_seed: dict[str, Any], career_id: ObjectId) -> None:
    for project_title in career_seed["suggested_projects"]:
        project_doc = create_project_document(
            {
                "title": project_title,
                "description": f"Portfolio project for the {career_seed['title']} roadmap.",
                "career_path_id": career_id,
                "difficulty": career_seed["difficulty_level"],
                "required_skills": career_seed["required_skills"][:5],
                "tools": career_seed["recommended_tools"][:5],
                "estimated_duration_weeks": 3,
                "instructions": [
                    "Define the problem and success criteria.",
                    "Build an implementation with clean documentation.",
                    "Publish code and a short project write-up.",
                ],
                "expected_output": "A GitHub repository with a working implementation and README.",
                "evaluation_criteria": ["Correctness", "Code quality", "Documentation", "Portfolio value"],
            }
        )
        await db.projects.update_one(
            {"title": project_title, "career_path_id": career_id},
            {"$set": project_doc},
            upsert=True,
        )


async def _seed_interviews_and_certifications(db, career_seed: dict[str, Any], career_id: ObjectId) -> None:
    for question in career_seed["interview_questions"]:
        question_doc = create_interview_question_document({**question, "career_path_id": career_id})
        await db.interview_questions.update_one(
            {"career_path_id": career_id, "question": question_doc["question"]},
            {"$set": question_doc},
            upsert=True,
        )
    for certification in career_seed["certifications"]:
        certification_doc = create_certification_document({**certification, "career_path_id": career_id})
        await db.certifications.update_one(
            {"career_path_id": career_id, "title": certification_doc["title"]},
            {"$set": certification_doc},
            upsert=True,
        )


async def seed_database() -> None:
    db = get_database()
    await _seed_skills(db)
    for career_seed in CAREER_SEEDS:
        career_id = await _upsert_career(db, career_seed)
        await _seed_roadmap(db, career_seed, career_id)
        await _seed_resources(db, career_seed, career_id)
        await _seed_projects(db, career_seed, career_id)
        await _seed_interviews_and_certifications(db, career_seed, career_id)


async def main() -> None:
    await connect_to_mongo()
    try:
        await seed_database()
    finally:
        await close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(main())
