import type { CareerAssessmentResult, CareerPath, QuizAnswers, RoadmapPhase } from "../types";
import { buildRoadmapForCareer } from "../data/roadmaps";
import { careers, getCareerById } from "../data/careers";
import { normalizeRoadmapProgress } from "../utils/progress";
import { apiRequest, USE_BACKEND_API } from "./api";

const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));

const areaToCareer: Record<string, string> = {
  "Artificial Intelligence": "ai-engineer",
  "Machine Learning": "machine-learning-engineer",
  "Data and Analytics": "data-scientist",
  "Software Engineering": "software-engineer",
  "Backend Systems": "backend-developer",
  "Frontend Web": "frontend-developer",
  "Mobile Apps": "mobile-developer",
  Cybersecurity: "cybersecurity-analyst",
  Cloud: "cloud-engineer",
  DevOps: "devops-engineer",
  "UI/UX and Product": "ui-ux-designer"
};

const inferCareerFromQuiz = (answers: QuizAnswers) => {
  if (answers.preferredArea && areaToCareer[answers.preferredArea]) {
    return areaToCareer[answers.preferredArea];
  }

  const subjects = answers.favoriteSubjects.join(" ").toLowerCase();
  const skills = answers.currentSkills.join(" ").toLowerCase();
  const goal = answers.careerGoal.toLowerCase();
  const text = `${subjects} ${skills} ${goal}`;

  if (text.includes("security") || text.includes("network")) return "cybersecurity-analyst";
  if (text.includes("mobile") || text.includes("react native")) return "mobile-developer";
  if (text.includes("cloud") || text.includes("aws")) return "cloud-engineer";
  if (text.includes("data") || text.includes("statistics") || text.includes("sql")) return "data-scientist";
  if (text.includes("ai") || text.includes("machine learning")) return "ai-engineer";
  if (text.includes("design") || text.includes("ux")) return "ui-ux-designer";
  return "software-engineer";
};

const subjectCareerMap: Record<string, string[]> = {
  Algorithms: ["software-engineer", "backend-developer", "devops-engineer"],
  Databases: ["backend-developer", "data-scientist", "software-engineer"],
  Math: ["ai-engineer", "machine-learning-engineer", "data-scientist"],
  Statistics: ["data-scientist", "machine-learning-engineer", "ai-engineer"],
  Networks: ["cybersecurity-analyst", "cloud-engineer", "devops-engineer"],
  Design: ["ui-ux-designer", "frontend-developer", "mobile-developer"],
  Security: ["cybersecurity-analyst", "backend-developer", "cloud-engineer"],
  Mobile: ["mobile-developer", "frontend-developer", "software-engineer"],
  Web: ["frontend-developer", "backend-developer", "software-engineer"],
  AI: ["ai-engineer", "machine-learning-engineer", "data-scientist"]
};

const experienceBonus: Record<string, Record<string, number>> = {
  Beginner: { "Beginner Friendly": 12, Intermediate: 5, Advanced: 1 },
  "Basic projects": { "Beginner Friendly": 9, Intermediate: 10, Advanced: 4 },
  Intermediate: { "Beginner Friendly": 4, Intermediate: 12, Advanced: 9 },
  Advanced: { "Beginner Friendly": 2, Intermediate: 8, Advanced: 14 }
};

const tokenize = (values: string[] | string) => {
  const list = Array.isArray(values) ? values : [values];
  return new Set(
    list
      .join(" ")
      .toLowerCase()
      .replace(/[/-]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 1)
  );
};

const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const scoreCareer = (career: CareerPath, answers: QuizAnswers) => {
  let score = 18;
  const reasons: string[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (areaToCareer[answers.preferredArea] === career.id) {
    score += 28;
    reasons.push(`Direct alignment with ${answers.preferredArea}.`);
    strengths.push(`Clear interest in ${answers.preferredArea}.`);
  }

  const subjectMatches = answers.favoriteSubjects.filter((subject) => subjectCareerMap[subject]?.includes(career.id));
  if (subjectMatches.length) {
    score += Math.min(24, subjectMatches.length * 8);
    reasons.push(`Favorite subjects match: ${subjectMatches.slice(0, 3).join(", ")}.`);
    strengths.push(`Strong subject fit: ${subjectMatches.slice(0, 3).join(", ")}.`);
  }

  const currentSkillTokens = tokenize(answers.currentSkills);
  const requiredSkillTokens = tokenize([...career.requiredSkills, ...career.technicalSkills]);
  const matchedSkills = Array.from(currentSkillTokens).filter((skill) => requiredSkillTokens.has(skill));
  if (matchedSkills.length) {
    score += Math.min(22, matchedSkills.length * 7);
    reasons.push(`Existing skills support the role: ${matchedSkills.slice(0, 4).join(", ")}.`);
    strengths.push(`Relevant current skills: ${matchedSkills.slice(0, 4).join(", ")}.`);
  }

  const goalTokens = tokenize(answers.careerGoal);
  const careerTokens = tokenize([career.title, career.description, career.overview, ...career.responsibilities]);
  const goalOverlap = Array.from(goalTokens).filter((token) => careerTokens.has(token));
  if (goalOverlap.length) {
    score += Math.min(12, goalOverlap.length * 3);
    reasons.push("Career goal language matches this path.");
  }

  score += experienceBonus[answers.experienceLevel]?.[career.difficulty] ?? 4;

  if (answers.studyHoursPerWeek >= 12) {
    score += career.difficulty === "Advanced" ? 6 : 4;
    strengths.push("Weekly study time supports deeper specialization.");
  } else if (answers.studyHoursPerWeek < 6 && career.difficulty === "Advanced") {
    score -= 8;
    weaknesses.push("Advanced tracks need more weekly study time for steady progress.");
  }

  const currentSkillText = answers.currentSkills.join(" ").toLowerCase();
  const missingSkills = unique([...career.requiredSkills, ...career.technicalSkills]).filter(
    (skill) => !currentSkillText.includes(skill.toLowerCase())
  );
  if (missingSkills.length) {
    weaknesses.push(`Needs more practice in: ${missingSkills.slice(0, 3).join(", ")}.`);
  }

  return {
    career,
    matchPercentage: Math.max(45, Math.min(98, Math.round(score))),
    reasons: reasons.length ? reasons.slice(0, 3) : ["Balanced CS profile with transferable foundations."],
    strengths: strengths.length ? unique(strengths).slice(0, 4) : ["Broad CS interest gives flexibility across multiple tracks."],
    weaknesses: weaknesses.length ? unique(weaknesses).slice(0, 4) : ["Needs more portfolio evidence to validate readiness."],
    recommendedSkills: missingSkills.slice(0, 6)
  };
};

const buildAssessment = (answers: QuizAnswers): CareerAssessmentResult => {
  const scored = careers.map((career) => scoreCareer(career, answers)).sort((a, b) => b.matchPercentage - a.matchPercentage);
  const best = scored[0];
  return {
    bestCareer: best.career,
    matchPercentage: best.matchPercentage,
    alternatives: scored.slice(1, 4).map((item) => ({
      career: item.career,
      matchPercentage: item.matchPercentage,
      reasons: item.reasons
    })),
    allMatches: scored.map((item) => ({
      career: item.career,
      matchPercentage: item.matchPercentage,
      reasons: item.reasons
    })),
    strengths: best.strengths,
    weaknesses: best.weaknesses,
    recommendedSkills: unique(scored.slice(0, 3).flatMap((item) => item.recommendedSkills)).slice(0, 8)
  };
};

export const roadmapService = {
  async getMyRoadmap(defaultCareerId = "ai-engineer") {
    if (USE_BACKEND_API) {
      return apiRequest<{ career: ReturnType<typeof getCareerById>; phases: RoadmapPhase[] }>("/roadmaps/my-roadmap");
    }

    await delay();
    const career = careers.find((item) => item.id === defaultCareerId) || careers[0];
    return {
      career,
      phases: buildRoadmapForCareer(career.id)
    };
  },

  async assessCareer(answers: QuizAnswers) {
    if (USE_BACKEND_API) {
      return apiRequest<CareerAssessmentResult>("/quiz/submit", {
        method: "POST",
        body: answers
      });
    }

    await delay(900);
    return buildAssessment(answers);
  },

  async generateRoadmap(answers: QuizAnswers) {
    if (USE_BACKEND_API) {
      const assessment = await this.assessCareer(answers);
      return this.getRoadmapByCareer(assessment.bestCareer.id);
    }

    await delay(700);
    const careerId = buildAssessment(answers).bestCareer.id || inferCareerFromQuiz(answers);
    return {
      career: getCareerById(careerId),
      phases: buildRoadmapForCareer(careerId)
    };
  },

  async getRoadmapByCareer(careerId: string) {
    if (USE_BACKEND_API) {
      return apiRequest<{ career: ReturnType<typeof getCareerById>; phases: RoadmapPhase[] }>("/roadmaps/generate", {
        method: "POST",
        body: { careerId }
      });
    }

    await delay();
    const career = careers.find((item) => item.id === careerId) || careers[0];
    return {
      career,
      phases: buildRoadmapForCareer(career.id)
    };
  },

  async updateSkillProgress(phases: RoadmapPhase[], phaseId: string, skillId: string, completed: boolean) {
    if (USE_BACKEND_API) {
      const result = await apiRequest<{ phases: RoadmapPhase[] }>("/roadmaps/progress", {
        method: "PATCH",
        body: { phaseId, skillId, completed }
      });
      return result.phases;
    }

    await delay(150);
    const next = phases.map((phase) =>
      phase.id === phaseId
        ? {
            ...phase,
            skills: phase.skills.map((skill) => (skill.id === skillId ? { ...skill, completed } : skill))
          }
        : phase
    );
    return normalizeRoadmapProgress(next);
  }
};
