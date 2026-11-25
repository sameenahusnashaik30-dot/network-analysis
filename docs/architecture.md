# SENTINEL-X: Architecture Specification

## 1. High-Level Architecture Overview

SENTINEL-X is a trustworthy, open-world zero-day attack detection platform tailored for Software-Defined Networks (SDN).

```
                             +-------------------------+
                             |    React SOC Dashboard  |
                             | (TypeScript / Tailwind) |
                             +------------+------------+
                                          | REST / WebSocket
                             +------------v------------+
                             |      FastAPI Gateway    |
                             |  (JWT Auth, RBAC, WS)   |
                             +------------+------------+
                                          |
          +-------------------------------+-------------------------------+
          |                               |                               |
+---------v---------+           +---------v---------+           +---------v---------+
|    SDN Subsystem  |           | Hybrid ML Subsys  |           |   XAI Subsystem   |
| - Ryu Controller  |           | - Known Classifier|           | - SHAP Engine     |
| - OpenFlow 1.3    |           | - Autoencoder AD  |           | - LIME Engine     |
| - Flow Rule Sync  |           | - Open-Set Engine |           | - Stability Test  |
+---------+---------+           +---------+---------+           +---------+---------+
          |                               |                               |
          +-------------------------------+-------------------------------+
                                          |
                             +------------v------------+
                             | Repository / DB Layer   |
                             | (MongoDB / SQLite)      |
                             +-------------------------+
```

## 2. Detection Pipeline Sequence

1. **Flow Ingestion**: Ryu controller captures network packet statistics via OpenFlow statistics requests (`OFPFlowStatsRequest`).
2. **Feature Extraction**: Features such as `packet_count`, `byte_count`, `packet_rate`, `byte_rate`, `duration_sec`, `protocol`, `port_entropy`, and `tcp_flags` are extracted.
3. **Layer A - Known Attack Classifier**: Random Forest / XGBoost evaluates if the feature vector strongly belongs to a known pattern (`Normal`, `DDoS`, `DoS`, `Port Scan`, `Brute Force`, `Botnet`, `Web Attack`).
4. **Layer B - Anomaly Detection (Autoencoder)**: Calculates reconstruction error $\mathcal{L}_{rec} = \|x - \hat{x}\|^2$ against a baseline threshold $\tau_{anomaly}$.
5. **Layer C - Open-Set / Zero-Day Engine**: If confidence in known classes is low ($\max_c P(y=c|x) < \tau_{known}$) and reconstruction error is high ($\mathcal{L}_{rec} > \tau_{anomaly}$), the sample is flagged as `UNKNOWN / ZERO-DAY CANDIDATE`.
6. **XAI Attribution**: SHAP values compute feature-level Shapley contributions; LIME computes a localized interpretable explanation.
7. **Explanation Reliability**: Input is perturbed by Gaussian and uniform noise to evaluate stability of feature importance rank using Spearman rank correlation.
8. **SDN Correlation**: Traffic anomalies are linked to controller switch packet-in surges and flow-rule shifts.
9. **Mitigation Workflow**: Generates response options (`Block Flow`, `Quarantine`, `Rate Limit`). Execution requires authenticated Admin approval, logged to an immutable audit trail.
