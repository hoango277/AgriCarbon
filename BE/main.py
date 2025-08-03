from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from configs.database import engine, Base
from configs.database_utils import init_database
from configs.settings import settings
from routers import auth, crop, carbon

# Import models để register với Base.metadata
from models import user, crop_declaration, commitment, carbon_tracking

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize database with auto-update
init_database()

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
app.include_router(crop.router, prefix="/api/crop", tags=["Crop Management"])
app.include_router(carbon.router, prefix="/api", tags=["Carbon Tracking"])

@app.get("/")
def root():
    return {"message": "Welcome to AgriCarbon API"} 