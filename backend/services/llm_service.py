import httpx
import json
import logging
import re
from config import settings

logger = logging.getLogger(__name__)

# Real, official Google Gemini model names prioritized by active API availability
GEMINI_MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-3-flash-preview",
    "gemini-3.1-flash-lite-preview",
    "gemini-flash-lite-latest",
    "gemma-4-26b-a4b-it",
    "gemini-flash-latest",
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
    Cascades through active models and handles rapid fallback if all fail.
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
            "temperature": 0.4, # Balanced temperature for dynamic conversational intelligence
            "maxOutputTokens": 4096
        }
    }
    
    if expect_json:
        payload["generationConfig"]["responseMimeType"] = "application/json"
        
    last_error = None
    timeout_config = httpx.Timeout(25.0, connect=10.0)

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
                elif response.status_code == 401:
                    # Invalid API key - abort immediately
                    last_error = "Invalid Gemini API Key (401 Unauthorized)"
                    logger.warning(f"Gemini API returned 401. Aborting key.")
                    break
                else:
                    last_error = f"Model {model_name} status {response.status_code}: {response.text[:100]}"
                    logger.info(f"Model {model_name} returned {response.status_code}. Trying next model in cascade...")
        except httpx.RequestError as exc:
            last_error = str(exc)
            logger.warning(f"Connection error to {model_name}: {exc}")
        except Exception as exc:
            last_error = str(exc)
            logger.warning(f"Error calling {model_name}: {exc}")

    raise ValueError(f"All Gemini models exhausted: {last_error}")

