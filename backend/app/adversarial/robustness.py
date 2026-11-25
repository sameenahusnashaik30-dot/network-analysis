from app.adversarial.evaluator import adversarial_evaluator

def evaluate_robustness(config: dict) -> dict:
    return adversarial_evaluator.run_experiment(
        model_name=config.get("model_name", "XGBoost Classifier"),
        dataset_name=config.get("dataset_name", "CIC-IDS2017 SDN Test Subset"),
        attack_category=config.get("attack_category", "Feature Perturbation"),
        epsilon=float(config.get("perturbation_epsilon", 0.12)),
        iterations=int(config.get("iterations", 50)),
    )
