# API Documentation

Base URL: `http://localhost:8000`

## Authentication

### POST `/auth/register`

Registers a student and returns a JWT token.

Request:

```json
{
  "fullName": "PathFinder Student",
  "email": "student@example.com",
  "password": "secret123",
  "university": "Faculty of Computer Science",
  "academicYear": "Third year",
  "selectedCareerPath": "software-engineer",
  "careerInterest": "Software Engineer",
  "studyHoursPerWeek": 8
}
```

### POST `/auth/login`

Authenticates a student.

Request:

```json
{
  "email": "student@example.com",
  "password": "secret123",
  "remember": true
}
```

## Users

- `GET /users/me` - Returns the authenticated student profile.
- `PUT /users/me` - Updates profile fields.

## Careers

- `GET /careers` - Returns all career paths.
- `GET /careers/{career_id}` - Returns details for one career path.

## Career Assessment

### POST `/quiz/submit`

Submits assessment answers and returns AI-style career matching analysis.

Response includes:

- Best matched career path
- Match percentage
- Top 3 alternative careers
- Full ranked career match list with match percentage for every career path
- Strengths
- Weaknesses
- Recommended skills to improve

Roadmap generation stays separate through `POST /roadmaps/generate`.

## Roadmaps

- `GET /roadmaps/my-roadmap` - Returns or creates the current user's roadmap.
- `POST /roadmaps/generate` - Generates a roadmap for a chosen career.
- `PATCH /roadmaps/progress` - Updates completion for one skill.

Progress update request:

```json
{
  "phaseId": "software-engineer-dsa",
  "skillId": "arrays-strings",
  "completed": true
}
```

## Progress

- `GET /progress/summary` - Returns overall progress, completed skills, remaining skills, streak, weekly study target, and recent completed tasks.

## Advanced Platform

- `GET /dashboard/summary` - Returns career readiness score, roadmap progress, completed skills/projects, weekly study hours, streak, next recommended task, and recent activity.
- `GET /platform/state` - Returns the advanced platform state for skill tracker, project portfolio, study planner, resume builder, interview prep, certifications, GitHub checklist, and reminders.
- `PUT /platform/state` - Accepts a full platform state payload for future backend persistence.
- `GET /skills` - Returns skill tracker items for the selected career path.
- `GET /projects` - Returns suggested portfolio projects for the selected career path.
- `GET /resources` - Returns learning resources grouped by career path.
- `POST /planner/generate` - Generates weekly study tasks from career path, weekly hours, and target completion date.
- `GET /interviews` - Returns technical, behavioral, and coding interview prep tasks.
- `GET /certifications` - Returns recommended certifications for the selected career path.
- `GET /portfolio/github-checklist` - Returns GitHub portfolio readiness checklist items.
- `GET /notifications/settings` - Returns reminder settings for weekly goals, roadmap deadlines, and study streaks.
- `GET /analytics/summary` - Returns analytics-ready career readiness summary data.
