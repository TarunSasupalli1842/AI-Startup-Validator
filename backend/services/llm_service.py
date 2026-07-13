import httpx
import json
import logging
from config import settings

logger = logging.getLogger(__name__)

async def call_gemini(prompt: str, expect_json: bool = False, system_instruction: str = "") -> str:
    """
    Communicates with the Gemini 1.5 Flash API asynchronously using direct HTTP requests.
    Enforces JSON return formatting if expect_json is True.
    """
    if not settings.is_gemini_configured:
        logger.warning("Gemini API key is not configured in .env. Skipping LLM request.")
        raise ValueError("Gemini API key not configured.")
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
    
    # Configure safety settings and prompt parameters
    contents = []
    
    # Format system instructions or user instructions
    formatted_prompt = prompt
    if system_instruction:
        formatted_prompt = f"System Instruction: {system_instruction}\n\nUser Input: {prompt}"
        
    contents.append({
        "parts": [{"text": formatted_prompt}]
    })
    
    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.2, # Lower temperature for analytical validation tasks
            "maxOutputTokens": 4096
        }
    }
    
    if expect_json:
        payload["generationConfig"]["responseMimeType"] = "application/json"
        
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
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
                logger.error(f"Gemini API returned status code {response.status_code}: {response.text}")
                raise ValueError(f"Gemini API error (Status {response.status_code}): {response.text}")
    except httpx.RequestError as exc:
        logger.error(f"HTTP connection error when accessing Gemini: {exc}")
        raise ValueError(f"Failed to communicate with Gemini API: {str(exc)}")
    except Exception as exc:
        logger.error(f"Unexpected error when calling Gemini service: {exc}")
        raise ValueError(f"Unexpected LLM error: {str(exc)}")
