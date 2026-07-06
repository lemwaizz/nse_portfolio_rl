from fastapi import APIRouter, HTTPException
from app.schemas import RecommendationRequest, RecommendationResponse
from app import model as ml
import logging

logger = logging.getLogger("uvicorn")
router = APIRouter()

@router.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendation(body: RecommendationRequest):
    try:
        result = ml.predict(body)
        logger.info(f"Prediction ok: action={result.action_type} ticker={result.ticker} "
                    f"confidence={result.action_confidence}")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))