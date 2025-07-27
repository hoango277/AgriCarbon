from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from configs.database import engine, Base
from routers import auth

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AgriCarbon API",
    description="API for agricultural carbon management and farmer registration system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],  # Frontend URL from environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

@app.get("/")
def root():
    return {"message": "Welcome to AgriCarbon API"} 