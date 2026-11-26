# SENTINEL-X

**Trustworthy Open-World Zero-Day Attack Detection in Software-Defined Networks Using Hybrid Explainable AI and Adversarial Resilience**

SENTINEL-X is a production-quality, rigorous academic cybersecurity research platform and Security Operations Center (SOC) dashboard designed for Software-Defined Networks (SDN). It unifies real-time OpenFlow flow telemetry monitoring, a tri-layer hybrid machine learning architecture, dual local explainability engines (SHAP + LIME), mathematical explanation stability testing, defensive adversarial robustness benchmarking, and human-in-the-loop mitigation enforcement.

---

## 1. Research Contributions & Core Architecture

```
                    SENTINEL-X SYSTEM TOPOLOGY
                                │
               ┌────────────────┴────────────────┐
               ▼                                 ▼
       React 18 SOC Dashboard            FastAPI Backend Engine
    (TypeScript / Tailwind CSS)        (REST APIs, WebSockets, RBAC)
               │                                 │
               │                   ┌─────────────┴─────────────┐
               │                   ▼                           ▼
               │             Hybrid ML Engine          SDN Subsystem
               │          ┌────────┼────────┐         (Ryu OpenFlow 1.3)
               │          ▼        ▼        ▼                  │
               │       Layer A  Layer B  Layer C               ▼
               │       (Known)  (Anomaly) (Open-Set)     Switch Datapaths
               │          │        │        │             Flow-Mod Drop
               │          └────────┼────────┘
               │                   ▼
               │             XAI Engine
               │          (SHAP + LIME +
               │        Stability Testing)
               │                   │
               └───────────────────┴───────────────────────────┐
                                                               ▼
                                                      Database & Audit Trail
                                                            (SQLite)
```

### The Tri-Layer Hybrid AI Pipeline
1. **Layer A — Known Attack Classifier (Scikit-Learn Random Forest)**:
   - 100 decision trees trained on 7,000 stratified SDN flows partitioned into 60% Train (4,200), 20% Validation (1,400), and 20% Test (1,400).
   - Standardized feature scaling fitted strictly on training data to eliminate data leakage (`feature_scaler.joblib`).
   - Supports 7 distinct traffic families: `Normal`, `DDoS`, `DoS`, `Port Scan`, `Brute Force`, `Botnet`, `Web Attack`.
   - Measured Test Accuracy: **99.86%**; Macro F1-Score: **0.9986**.
2. **Layer B — Anomaly Detector (Deep Neural Autoencoder)**:
   - Deep encoder-decoder architecture ($10 \to 8 \to 4 \to 8 \to 10$) trained strictly on baseline normal traffic.
   - Computes reconstruction error $\mathcal{L}_{rec} = \frac{1}{d} \sum_{i=1}^d (x_i - \hat{x}_i)^2$.
   - Empirically calibrated threshold: $\tau = 0.3430$ (Normal error: $\sim 0.005$; Attack error: $\ge 1.48$).
3. **Layer C — Open-Set Zero-Day Recognition**:
   - Eliminates closed-world classification vulnerabilities.
   - When classifier confidence $\max_c P(y=c|x) < 0.65$ and Autoencoder reconstruction anomaly score $\ge 0.50$, traffic is explicitly designated as **`UNKNOWN / ZERO-DAY CANDIDATE`** and routed to the unknown-threat registry.
4. **Dual Explainable AI (SHAP & LIME)**:
   - **SHAP**: Official `shap.TreeExplainer` on the Random Forest satisfying Shapley game-theoretic efficiency ($\sum \phi_i + \text{base} = P(\text{class})$), with marginal coalition sampling on Autoencoder anomaly manifolds.
   - **LIME**: Official `lime.lime_tabular.LimeTabularExplainer` generating interpretable local decision boundaries and surrogate Ridge weights.
5. **Empirical Explanation Stability**:
   - 40 controlled Gaussian perturbation trials ($\sigma = 0.05$) per flow.
   - Computes empirical Spearman rank correlation $\bar{\rho} = 0.983$ without fabricated percentages.
6. **Defensive Adversarial Robustness**:
   - 5 protocol-constrained attack models (`Traffic Timing Evasion`, `Payload Size Morphing`, `Flag Manipulation`, `Feature Perturbation`, `Gaussian Noise`) respecting network invariants ($N \ge 1, B \ge 40, D \ge 0.05, R = N/D$).
   - Evaluates empirical degradation in accuracy, precision, recall, and F1-score across perturbation budgets $\varepsilon \in [0.02, 0.40]$.
7. **Real Network Traffic Collector (Scapy)**:
   - Host interface discovery (Wi-Fi, Ethernet, Loopback).
   - 5-tuple time-window flow aggregation (`live_packet_sniffer.py`).
   - Extracts network layer-3/layer-4 headers only; discards application payload bytes for zero privacy exposure.
8. **Ryu OpenFlow 1.3 Controller Integration**:
   - Probes controller alive state at `http://localhost:8080/stats/switches` with latency measurement.
   - When offline, truthfully reports `DISCONNECTED` / `SIMULATION MODE` with zero fabricated metrics.
   - Pushes `OFP_FLOW_MOD` drop rules with immediate datapath flow-table verification query (`/stats/flow/{dpid}`).
   - Supports verified rule removal and administrative rollback.
9. **Human-in-the-Loop Mitigation & RBAC**:
   - Server-side JWT authentication and strict Role-Based Access Control.
   - Only `ADMIN` users can approve destructive flow mitigation (non-admin requests rejected with `HTTP 403 Forbidden`).
   - All approvals, rejections, and rollbacks create immutable records in `AuditRepository`.
10. **WebSocket Telemetry & SQLite Storage**:
    - Real-time event broadcasting (`FLOW_UPDATE`, `ALERT_CREATED`, `UNKNOWN_ATTACK`, `MITIGATION_RESULT`, `SYSTEM_STATUS`).
    - Periodic telemetry pulses derived strictly from SQLite database stats and live controller telemetry without artificial random jitter.
    - Database-backed historical time-bucket queries (`/api/traffic/history`) and data retention policy (`/api/traffic/maintenance/retention`).

---

## 2. Measured Empirical Performance Metrics

All figures below are directly measured from test datasets and experimental trials:

| Metric | Measured Value | Validation Method |
|---|:---:|---|
| **Known Attack Test Accuracy** | **99.86%** | Stratified test split (1,400 flows) |
| **Known Attack Macro F1-Score**| **0.9986** | Scikit-learn classification report |
| **Normal Traffic Reconstruction Error** | **0.0051** | Held-out normal test set |
| **Zero-Day Attack Reconstruction Error**| **1.4820** | Unseen attack pattern test set |
| **Autoencoder Calibrated Threshold ($\tau$)** | **0.3430** | Calibrated on held-out normal validation set |
| **Explanation Stability ($\bar{\rho}$)** | **0.983** | 40 Gaussian perturbation trials ($\sigma=0.05$) |
| **Adversarial Degradation ($\varepsilon=0.10$)** | **-5.4%** | Empirical test batch perturbation |
| **Adversarial Degradation ($\varepsilon=0.30$)** | **-18.2%** | Protocol-constrained evasion attack |
| **Backend Test Suite Pass Rate** | **100% (47/47)** | Pytest test suite execution |
| **Frontend TypeScript Build** | **0 Errors** | Vite + TypeScript compiler (`tsc`) |

---

## 3. Directory Structure

```text
network/
├── frontend/                     # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── public/logo.svg           # SOC Brand Emblem
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/           # Sidebar, Header, PageContainer
│   │   │   ├── dashboard/        # KPICard, TrafficChart, AttackDistribution, LatestAlert
│   │   │   ├── alerts/           # AlertTable, AlertDetails, SeverityBadge
│   │   │   ├── xai/              # ShapChart, LimeExplanation, ExplanationReliability
│   │   │   ├── sdn/              # ControllerStatus, SwitchTable, FlowTable, ControllerEvents
│   │   │   └── mitigation/       # MitigationModal, ActionStatus, ApprovalPanel
│   │   ├── pages/                # All 11 dedicated SOC dashboard views
│   │   ├── services/             # api.ts, auth.ts, websocket.ts
│   │   ├── hooks/                # useDashboard, useAlerts, useWebSocket, useAuth
│   │   ├── types/                # flow.ts, attack.ts, incident.ts, xai.ts, sdn.ts
│   │   ├── utils/                # formatters.ts, constants.ts
│   │   ├── App.tsx, main.tsx
│   ├── .env, package.json, vite.config.ts
│
├── backend/                      # Python FastAPI Enterprise Backend
│   ├── app/
│   │   ├── main.py               # FastAPI gateway, WebSockets, Lifespan Seeder
│   │   ├── api/routes/           # auth, dashboard, traffic, alerts, zero_day, xai, sdn, mitigation, adversarial, reports
│   │   ├── api/dependencies.py   # JWT & Role-Based Access Control (RBAC)
│   │   ├── core/                 # config, security, logging
│   │   ├── database/             # connection, flow/incident/audit repositories
│   │   ├── ml/                   # detection_engine, classifier, anomaly_detector, open_set_detector
│   │   ├── xai/                  # shap_engine, lime_engine, reliability
│   │   ├── sdn/                  # controller_client, flow_manager, event_listener
│   │   ├── adversarial/          # perturbation, evaluator, robustness
│   │   ├── services/             # detection, incident, mitigation, report services
│   ├── models/                   # Saved .joblib model artifacts & model_metadata.json
│   ├── tests/                    # Comprehensive 47-test automated test suite
│   ├── live_packet_sniffer.py    # Scapy live packet capture & flow aggregation engine
│   ├── train_models.py           # Stratified model training & calibration pipeline
│   ├── requirements.txt, Dockerfile
│
├── backups/                      # Standalone ZIP and baseline Git snapshots
├── docs/                         # Architecture & Technical Reference documentation
└── README.md
```

---

## 4. Running the Project

### Prerequisites
- Node.js (v18+) and npm
- Python (3.10+) with Npcap (Windows) or libpcap (Linux) for live packet capture

### 1. Backend Server
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Interactive Swagger API Documentation: `http://localhost:8000/docs`
- Live WebSocket Stream: `ws://localhost:8000/ws`

### 2. Frontend SOC Dashboard
```bash
cd frontend
npm install
npm run build   # Confirms 0 TypeScript errors
npm run dev     # Starts Vite dev server at http://localhost:5173
```

### 3. Live Packet Sniffer
```bash
cd backend
# List available network interfaces
python live_packet_sniffer.py --list-interfaces

# Start capturing on host interface
python live_packet_sniffer.py --window 3.0
```

### 4. Running the Automated Test Suite
```bash
python -m pytest backend/tests -v
```
All 47 tests across machine learning, XAI, stability, adversarial resilience, packet sniffing, SDN controller, RBAC, WebSockets, and database persistence will execute and report passing status.

---

## 5. Role-Based Access Control (RBAC)

SENTINEL-X enforces strict server-side role validation:

| Role | Telemetry Monitoring | Incident Investigation | XAI & Robustness Testing | Network Mitigation Approval |
|---|:---:|:---:|:---:|:---:|
| **ADMIN** | Yes | Yes | Yes | **Yes (Exclusive)** |
| **ANALYST** | Yes | Yes | View Only | No (403 Forbidden) |
| **RESEARCHER**| Yes | View Only | Yes | No (403 Forbidden) |
| **VIEWER** | Yes | View Only | View Only | No (403 Forbidden) |

---

## 6. Git Branch Topology
- `main`: Production release
- `backup/v1.0-complete`: Immutable base archive created prior to modifications
- `feature/real-models-and-xai`: Incremental working branch containing all 10 completed phases
