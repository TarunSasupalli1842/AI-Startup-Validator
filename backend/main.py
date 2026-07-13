import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.validate import router as validation_router
from config import settings
import logging

# Configure basic logging format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multi-Agent AI validation pipeline for startup business ideas.",
    version="1.0.0"
)

# Set up CORS middleware to allow cross-origin API calls from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all origins. Can be restricted to specific localhost paths in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the routes
app.include_router(validation_router)

@app.get("/")
def get_root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "config": {
            "gemini_api_active": settings.is_gemini_configured,
            "tavily_search_active": settings.is_tavily_configured
        }
    }

if __name__ == "__main__":
    logger.info(f"Starting server on {settings.HOST}:{settings.PORT}...")
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
