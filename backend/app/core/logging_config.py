import logging
import sys
from app.core.config import settings

def setup_logging():
    log_format = "[%(asctime)s] [%(levelname)s] [%(name)s] - %(message)s"
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    # Quiet down third-party loggers if needed
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

logger = logging.getLogger("sentinel_x")
