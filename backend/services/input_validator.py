import re
import logging
from typing import Dict, Tuple, List
from config import settings
from services.llm_service import call_gemini

logger = logging.getLogger(__name__)

# Common profanity / unwanted / spam terms list (lowercase)
UNWANTED_WORDS = {
    "fake", "dummy", "testing123", "asdf", "qwerty", "hjkl", "zxcv",
    "garbage", "rubbish", "spam", "fuck", "shit", "bitch", "asshole",
    "dick", "pussy", "bastard", "crap", "idiot"
}

# Known keyboard mash patterns
KEYBOARD_MASH_PATTERNS = [
    r"asdfgh",
    r"dfghjk",
    r"fghjkl",
    r"qwerty",
    r"wertyu",
    r"ertyui",
    r"rtyuio",
    r"tyuiop",
    r"zxcvbn",
    r"xcvbnm",
    r"(.)\1{4,}",   # e.g., "aaaaa", "11111"
    r"(..)\1{3,}",  # e.g., "abababab", "asdfasdf"
]

def check_heuristics(text: str, field_name: str) -> Tuple[bool, str]:
    """
    Fast local heuristic check for gibberish, keyboard mashes, repetitive chars, and profanity.
    """
    clean_text = text.strip()
    if not clean_text:
        return False, f"The '{field_name}' field cannot be empty."

    # Minimum character check
    if len(clean_text) < 2 and field_name != "name":
        return False, f"The '{field_name}' field is too short. Please provide a meaningful description."

    lower_text = clean_text.lower()

    # Check for unwanted / profane words
    words = re.findall(r'\b\w+\b', lower_text)
    for word in words:
        if word in UNWANTED_WORDS:
            return False, f"The '{field_name}' contains inappropriate, spam, or placeholder content ('{word}')."

    # Check keyboard mash patterns
    for pattern in KEYBOARD_MASH_PATTERNS:
        if re.search(pattern, lower_text):
            return False, f"The '{field_name}' contains invalid keyboard mash or repetitive character sequences."

    # Vowel to consonant ratio check for longer text (words longer than 5 chars without vowels)
    for word in words:
        if len(word) >= 6 and not any(v in word for v in "aeiouy"):
            return False, f"The '{field_name}' contains unreadable or gibberish words ('{word}')."

    # Check word diversity (e.g. "test test test test test")
    if len(words) >= 4:
        unique_ratio = len(set(words)) / len(words)
        if unique_ratio < 0.3:
            return False, f"The '{field_name}' contains excessive word repetition."

    return True, ""

async def validate_startup_input(raw_input: Dict[str, str]) -> Tuple[bool, str]:
    """
    Validates a startup submission payload for quality, gibberish, profanity, and coherence.
    Returns (is_valid: bool, reason: str).
    """
    name = raw_input.get("name", "").strip()
    problem = raw_input.get("problem", "").strip()
    solution = raw_input.get("solution", "").strip()
    target_audience = raw_input.get("target_audience", "").strip()
    industry = raw_input.get("industry", "").strip()

    # Step 1: Run Heuristics on all key fields
    field_checks = [
        (name, "Startup Name"),
        (industry, "Industry / Domain"),
        (target_audience, "Target Audience"),
        (problem, "Problem Statement"),
        (solution, "Proposed Solution"),
    ]

    for val, label in field_checks:
        is_ok, err_msg = check_heuristics(val, label)
        if not is_ok:
            logger.warning(f"Heuristic input validation failed: {err_msg}")
            return False, err_msg

    # Ensure problem and solution have at least 3 distinct words each
    problem_words = [w for w in re.findall(r'\b\w+\b', problem.lower()) if len(w) > 1]
    solution_words = [w for w in re.findall(r'\b\w+\b', solution.lower()) if len(w) > 1]

    if len(set(problem_words)) < 3:
        return False, "The Problem Statement must contain at least 3 distinct meaningful words explaining the problem."

    if len(set(solution_words)) < 3:
        return False, "The Proposed Solution must contain at least 3 distinct meaningful words explaining the solution."

    # Step 2: AI Guardrail validation using Gemini (if available)
    if settings.is_gemini_configured:
        prompt = f"""
        Analyze the following startup idea submission:
        - Startup Name: "{name}"
        - Industry: "{industry}"
        - Target Audience: "{target_audience}"
        - Problem: "{problem}"
        - Solution: "{solution}"

        Your job is to determine if this input represents a genuine, understandable business concept OR if it is gibberish, keyboard mash, nonsensical noise, spam, or test garbage.

        Criteria for INVALID input:
        1. Pure gibberish, random text, or keyboard smashes (e.g. "asdfghjk", "dfg sfdg").
        2. Nonsensical or meaningless statements that make no logical business sense.
        3. Profanity, offensive language, or spam text.

        Return strictly a JSON object:
        {{
            "is_valid": true or false,
            "reason": "Clear 1-sentence reason if invalid, or empty string if valid"
        }}
        """
        system_instruction = "You are a strict input validation guardrail for a startup validation application. Reject gibberish, spam, and nonsensical text."

        try:
            response_text = await call_gemini(prompt, expect_json=True, system_instruction=system_instruction)
            import json
            data = json.loads(response_text)
            is_valid = data.get("is_valid", True)
            reason = data.get("reason", "")

            if not is_valid:
                logger.warning(f"AI Input Validation Guardrail rejected input: {reason}")
                return False, reason or "The submitted startup details appear to contain gibberish or nonsensical text."
        except Exception as e:
            logger.error(f"Error during AI input validation: {e}. Falling back to heuristic decision.")

    return True, ""
