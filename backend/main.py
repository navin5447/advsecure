from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from datetime import datetime

from config.settings import settings
from config.logging_config import setup_logging
from api.routes import router as api_router
from database.db_init import create_database
from models.model_manager import get_model_manager

# Setup logging
logger = setup_logging(settings.LOG_FILE, settings.LOG_LEVEL)

# Create database
create_database()

# Initialize FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION,
    debug=settings.DEBUG
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router)

@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    logger.info("="*60)
    logger.info("Starting AdvSecure API")
    logger.info(f"API Version: {settings.API_VERSION}")
    logger.info("="*60)
    
    # Load models
    manager = get_model_manager()
    if manager.is_ready():
        logger.info("✓ All models loaded successfully")
    else:
        logger.warning("⚠ Some models failed to load")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down AdvSecure API")

@app.get("/")
async def root():
    """Root endpoint"""
    return JSONResponse({
        "name": "AdvSecure",
        "version": settings.API_VERSION,
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "docs": "/docs"
    })

@app.get("/version")
async def version():
    """Get API version"""
    return {"version": settings.API_VERSION}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
