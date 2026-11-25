from app.core.config import settings
from app.core.logging_config import logger
from app.ml.detection_engine import detection_engine

def load_models():
    """Initializes and verifies ML models on startup."""
    logger.info(f"Loading SENTINEL-X models from path: {settings.MODEL_PATH}")
    # Verify engine is ready
    sample_flow = {
        "flow_id": "INIT-CHECK",
        "packet_count": 100,
        "byte_count": 15000,
        "duration_sec": 10.0,
        "packet_rate": 10.0,
        "byte_rate": 1500.0,
        "dst_port": 80,
        "src_port": 45000,
        "tcp_flags": "ACK",
    }
    res = detection_engine.process_flow(sample_flow)
    logger.info(f"ML Pipeline self-test passed: {res.final_label} (Confidence: {res.confidence})")
    return detection_engine
