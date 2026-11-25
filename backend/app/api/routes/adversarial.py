from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.adversarial.evaluator import adversarial_evaluator
from app.api.dependencies import get_current_user, require_role
from app.schemas.auth import TokenData

router = APIRouter(prefix="/adversarial", tags=["Adversarial Testing"])

class AdversarialExperimentRequest(BaseModel):
    model_name: str = "XGBoost Classifier"
    dataset_name: str = "CIC-IDS2017 SDN Test Subset"
    attack_category: str = "Feature Perturbation"
    perturbation_epsilon: float = 0.12
    iterations: int = 50

@router.post("/run")
async def run_adversarial_experiment(
    req: AdversarialExperimentRequest,
    current_user: TokenData = Depends(require_role(["ADMIN", "RESEARCHER"]))
):
    result = adversarial_evaluator.run_experiment(
        model_name=req.model_name,
        dataset_name=req.dataset_name,
        attack_category=req.attack_category,
        epsilon=req.perturbation_epsilon,
        iterations=req.iterations,
    )
    return result
