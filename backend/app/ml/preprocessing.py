import os
import joblib
import numpy as np
from typing import Dict, Any, List

FEATURE_NAMES = [
    "packet_count",
    "byte_count",
    "duration_sec",
    "packet_rate",
    "byte_rate",
    "dst_port",
    "src_port",
    "tcp_flag_syn",
    "tcp_flag_urg",
    "tcp_flag_rst",
]

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SCALER_PATH = os.path.join(BASE_DIR, "models", "feature_scaler.joblib")

# Baseline fallback parameters derived from normal SDN traffic
FEATURE_MEANS = np.array([2500.0, 180000.0, 30.0, 120.0, 8500.0, 443.0, 45000.0, 0.2, 0.0, 0.05])
FEATURE_STDS = np.array([3000.0, 250000.0, 25.0, 150.0, 12000.0, 1200.0, 15000.0, 0.4, 0.1, 0.2])

_LOADED_SCALER = None

def get_scaler():
    global _LOADED_SCALER
    if _LOADED_SCALER is None and os.path.exists(SCALER_PATH):
        try:
            _LOADED_SCALER = joblib.load(SCALER_PATH)
        except Exception:
            _LOADED_SCALER = None
    return _LOADED_SCALER

def extract_raw_features(flow_dict: Dict[str, Any]) -> np.ndarray:
    """Extract raw continuous and discrete flow attributes as a 1D float vector."""
    packet_count = float(flow_dict.get("packet_count", 0))
    byte_count = float(flow_dict.get("byte_count", 0))
    duration_sec = max(0.001, float(flow_dict.get("duration_sec", 1.0)))
    packet_rate = float(flow_dict.get("packet_rate", packet_count / duration_sec))
    byte_rate = float(flow_dict.get("byte_rate", byte_count / duration_sec))
    dst_port = float(flow_dict.get("dst_port", 80))
    src_port = float(flow_dict.get("src_port", 50000))

    flags = str(flow_dict.get("tcp_flags", "")).upper()
    syn = 1.0 if "SYN" in flags else 0.0
    urg = 1.0 if "URG" in flags else 0.0
    rst = 1.0 if "RST" in flags else 0.0

    return np.array([
        packet_count, byte_count, duration_sec, packet_rate, byte_rate,
        dst_port, src_port, syn, urg, rst
    ], dtype=np.float64)

def extract_features(flow_dict: Dict[str, Any]) -> np.ndarray:
    """Extract and standardize continuous and discrete flow attributes into a vector."""
    raw = extract_raw_features(flow_dict)
    scaler = get_scaler()
    if scaler is not None:
        try:
            return scaler.transform(raw.reshape(1, -1))[0]
        except Exception:
            pass
    # Fallback standard scaling
    return (raw - FEATURE_MEANS) / (FEATURE_STDS + 1e-6)
