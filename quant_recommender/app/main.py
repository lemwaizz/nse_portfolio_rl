from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.routes.recommend import router
from app import model as ml
import logging

logger = logging.getLogger("uvicorn")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Loading PPO model...")
    ml.load_model()
    logger.info("Model ready.")
    yield
    logger.info("Shutting down.")

app = FastAPI(
    title="Amana RL Recommendation API",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(router)

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": ml._model is not None}