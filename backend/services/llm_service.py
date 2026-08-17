import httpx
import json
import logging
from config import settings

logger = logging.getLogger(__name__)

# Primary and fallback model endpoints supported by Gemini API
GEMINI_MODELS = [
    "gemini-3.6-flash",
    "gemini-3.1-pro-preview",
    "gemini-2.5-flash",
    "gemini-2.5-pro"
]

async def call_gemini(prompt: str, expect_json: bool = False, system_instruction: str = "") -> str:
    """
    Communicates with the Gemini API asynchronously using direct HTTP requests.
    Enforces JSON return formatting if expect_json is True.
    """
    if not settings.is_gemini_configured:
        logger.warning("Gemini API key is not configured in .env. Skipping LLM request.")
        raise ValueError("Gemini API key not configured.")
        
    contents = []
    
    formatted_prompt = prompt
    if system_instruction:
        formatted_prompt = f"System Instruction: {system_instruction}\n\nUser Input: {prompt}"
        
    contents.append({
        "parts": [{"text": formatted_prompt}]
    })
    
    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.2, # Low temperature for objective analytical validation tasks
            "maxOutputTokens": 4096
        }
    }
    
    if expect_json:
        payload["generationConfig"]["responseMimeType"] = "application/json"
        
    last_error = None
    for model_name in GEMINI_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.GEMINI_API_KEY}"
        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                response = await client.post(url, json=payload, headers={"Content-Type": "application/json"})
                if response.status_code == 200:
                    data = response.json()
                    try:
                        text_content = data["candidates"][0]["content"]["parts"][0]["text"]
                        return text_content
                    except (KeyError, IndexError) as parse_err:
                        logger.error(f"Failed to parse Gemini API response JSON structure: {parse_err}. Raw: {data}")
                        raise ValueError("Failed to parse response structure from Gemini API.")
                else:
                    last_error = f"Status {response.status_code}: {response.text}"
                    logger.warning(f"Model {model_name} returned {response.status_code}: {response.text[:100]}. Trying next...")
        except httpx.RequestError as exc:
            last_error = str(exc)
            logger.warning(f"Connection error to {model_name}: {exc}")
        except Exception as exc:
            last_error = str(exc)
            logger.warning(f"Error calling {model_name}: {exc}")

    raise ValueError(f"Gemini API request failed across models: {last_error}")
