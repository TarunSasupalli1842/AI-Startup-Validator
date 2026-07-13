import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(override=True)

class Settings:
    PROJECT_NAME: str = "AI Startup Idea Validator API"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")
    
    # Fallback configuration
    # If keys are missing, we automatically use simulated mock agents
    @property
    def is_gemini_configured(self) -> bool:
        return bool(self.GEMINI_API_KEY.strip())
        
    @property
    def is_tavily_configured(self) -> bool:
        return bool(self.TAVILY_API_KEY.strip())

settings = Settings()
