# Database Schema

The backend uses SQLite by default through SQLAlchemy. The database file is generated at `backend/pathfinder.db` unless `DATABASE_URL` is changed.

## users

| Column | Type | Purpose |
| --- | --- | --- |
| id | Integer | Primary key |
| full_name | String | Student full name |
| email | String | Unique login email |
| hashed_password | String | Hashed password |
| university | String | University or college |
| academic_year | String | Academic year |
| selected_career_id | String | Current selected career path |
| career_interest | String | Human-readable career interest |
| study_hours_per_week | Integer | Weekly study target |
| is_active | Boolean | Account status |
| created_at | DateTime | Account creation timestamp |

## roadmap_states

| Column | Type | Purpose |
| --- | --- | --- |
| id | Integer | Primary key |
| user_id | Integer | One-to-one user reference |
| selected_career_id | String | Career used to generate phases |
| phases | JSON | Roadmap phases, skills, progress, courses, and projects |
| updated_at | DateTime | Last roadmap update |

## progress_events

| Column | Type | Purpose |
| --- | --- | --- |
| id | Integer | Primary key |
| user_id | Integer | User reference |
| phase_id | String | Roadmap phase id |
| phase_title | String | Roadmap phase title |
| skill_id | String | Completed skill id |
| skill_title | String | Completed skill title |
| created_at | DateTime | Completion timestamp |
