from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import assessments, auth, careers, certifications, interviews, notifications
from app.api.routes import profiles, progress, projects, readiness, resumes, roadmaps, skills, users
from app.core.config import settings
from app.db.mongodb import close_mongo_connection, connect_to_mongo


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(
    title=settings.project_name,
    version="2.0.0",
    description="Personalized career and learning roadmap API for CS students.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "ok", "service": "PathFinder API"}


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(profiles.router)
app.include_router(careers.router)
app.include_router(assessments.router)
app.include_router(assessments.matches_router)
app.include_router(roadmaps.router)
app.include_router(skills.router)
app.include_router(projects.router)
app.include_router(progress.router)
app.include_router(progress.study_plans_router)
app.include_router(readiness.router)
app.include_router(resumes.router)
app.include_router(interviews.router)
app.include_router(certifications.router)
app.include_router(notifications.router)
