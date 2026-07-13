import httpx
import logging
from config import settings

logger = logging.getLogger(__name__)

async def search_tavily(query: str, max_results: int = 5) -> dict:
    """
    Queries the Tavily Search API asynchronously to gather real-time web results.
    If the API key is missing, or the call fails, it logs the event and returns an empty results list.
    """
    if not settings.is_tavily_configured:
        logger.warning("Tavily API key not configured in .env. Skipping live web search.")
        return {"results": []}
    
    url = "https://api.tavily.com/search"
    payload = {
        "api_key": settings.TAVILY_API_KEY,
        "query": query,
        "search_depth": "basic",
        "max_results": max_results
    }
    
    try:
        # Using standard HTTPX client to communicate directly with the Tavily API
        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Tavily search successful for query: '{query}'. Found {len(data.get('results', []))} results.")
                return data
            else:
                logger.error(f"Tavily API returned status code {response.status_code}: {response.text}")
                return {"results": []}
    except httpx.RequestError as exc:
        logger.error(f"An HTTP error occurred while requesting Tavily: {exc}")
        return {"results": []}
    except Exception as exc:
        logger.error(f"An unexpected error occurred during Tavily search: {exc}")
        return {"results": []}
