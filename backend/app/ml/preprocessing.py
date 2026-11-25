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

# Baseline standard scaler parameters derived from normal SDN traffic
FEATURE_MEANS = np.array([2500.0, 180000.0, 30.0, 120.0, 8500.0, 443.0, 45000.0, 0.2, 0.0, 0.05])
FEATURE_STDS = np.array([3000.0, 250000.0, 25.0, 150.0, 12000.0, 1200.0, 15000.0, 0.4, 0.1, 0.2])

def extract_features(flow_dict: Dict[str, Any]) -> np.ndarray:
    """Extract and standardize continuous and discrete flow attributes into a vector."""
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

    raw_features = np.array([
        packet_count, byte_count, duration_sec, packet_rate, byte_rate,
        dst_port, src_port, syn, urg, rst
    ])

    # Standardize
    standardized = (raw_features - FEATURE_MEANS) / (FEATURE_STDS + 1e-6)
    return standardized
