import httpx
import json
import logging
import re
from config import settings

logger = logging.getLogger(__name__)

# Real, official Google Gemini model names supported by Generative Language API
GEMINI_MODELS = [
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-pro-latest"
]

def clean_json_text(text: str) -> str:
    """Strips Markdown code block fences and extracts JSON substring from LLM output."""
    cleaned = text.strip()
    # If wrapped in markdown code blocks e.g. ```json ... ```
    if "```" in cleaned:
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned, re.IGNORECASE)
        if match:
            cleaned = match.group(1).strip()
    # Extract first valid JSON object or array if extra text exists
    first_brace = cleaned.find("{")
    last_brace = cleaned.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        cleaned = cleaned[first_brace:last_brace + 1]
    return cleaned

async def call_gemini(prompt: str, expect_json: bool = False, system_instruction: str = "") -> str:
    """
    Communicates with the Gemini API asynchronously using direct HTTP requests.
    Enforces fast serverless execution and rapid fallback on quota exhaustion.
    """
    if not settings.is_gemini_configured:
        logger.warning("Gemini API key is not configured. Skipping LLM request.")
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
            "temperature": 0.2, # Low temperature for analytical validation
            "maxOutputTokens": 4096
        }
    }
    
    if expect_json:
        payload["generationConfig"]["responseMimeType"] = "application/json"
        
    last_error = None
    # Fast timeout to stay well within Vercel serverless function limits
    timeout_config = httpx.Timeout(5.0, connect=2.0)

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
                elif response.status_code in (429, 401, 403):
                    # Quota exceeded or invalid key: abort immediately to avoid multi-model timeout lag
                    last_error = f"Status {response.status_code}: {response.text[:100]}"
                    logger.warning(f"Gemini API returned {response.status_code} ({last_error}). Fast-exiting to fallback engine.")
                    break
                else:
                    last_error = f"Status {response.status_code}: {response.text[:100]}"
                    logger.warning(f"Model {model_name} returned {response.status_code}. Trying next model...")
        except httpx.RequestError as exc:
            last_error = str(exc)
            logger.warning(f"Connection error to {model_name}: {exc}")
        except Exception as exc:
            last_error = str(exc)
            logger.warning(f"Error calling {model_name}: {exc}")

    raise ValueError(f"Gemini API request failed: {last_error}")

