import httpx
import json
import logging
from config import settings

logger = logging.getLogger(__name__)

# Primary and fallback model endpoints supported by Gemini API (fastest and most reliable first)
GEMINI_MODELS = [
    "gemini-flash-lite-latest",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash-lite"
]

def clean_json_text(text: str) -> str:
    """Strips Markdown code block fences (e.g. ```json ... ```) from LLM text."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()
    return cleaned

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
    timeout_config = httpx.Timeout(12.0, connect=4.0)

    for model_name in GEMINI_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.GEMINI_API_KEY}"
        try:
            async with httpx.AsyncClient(timeout=timeout_config) as client:
                response = await client.post(url, json=payload, headers={"Content-Type": "application/json"})
                if response.status_code == 200:
                    data = response.json()
                    try:
                        text_content = data["candidates"][0]["content"]["parts"][0]["text"]
                        if expect_json:
                            text_content = clean_json_text(text_content)
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
