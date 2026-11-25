# SENTINEL-X: Technical Requirements Document (TRD)

## 1. System Architecture & Framework Stack

### Frontend Architecture
- **Framework**: React 18.3+ with TypeScript 5.6+ in Vite bundler mode.
- **Styling**: Tailwind CSS with custom SOC dark navy theme (`#0A0E1A`), glowing borders, and accessible high-contrast indicators.
- **Visualizations**: Recharts AreaChart, BarChart, PieChart with responsive containers.
- **Icons**: Lucide React.
- **State Management**: React hooks with centralized services (`api.ts`, `auth.ts`, `websocket.ts`).
- **Telemetry Streaming**: Native WebSocket connection with automated reconnection and graceful demo simulation fallback.

### Backend Architecture
- **API Engine**: Python 3.10+ FastAPI framework with asynchronous endpoints and Pydantic v2 schemas.
- **Authentication**: JWT tokens signed via HMAC-SHA256 (`python-jose`), bcrypt password hashing (`passlib`), and role-based access control (RBAC).
- **Database & Repositories**: Repository pattern over SQLite (`sentinel_x.db`) with forward-compatible schemas for MongoDB / PostgreSQL migration.
- **SDN Protocol**: Ryu OpenFlow 1.3 Controller interface (`OFPFlowStatsRequest`, `OFP_FLOW_MOD`).
- **Explainable AI (XAI)**: SHAP (marginal Shapley attribution) and LIME (local interpretable linear surrogates).
- **Explanation Reliability**: Controlled perturbation analysis calculating feature rank preservation under Gaussian variance.

## 2. Detection Pipeline Details

```
Network Flow Vector (x)
         │
         ▼
[ Preprocessing & Scaling ]
         │
         ├─────────────────────────────────────────┐
         ▼                                         ▼
[ Layer A: Supervised Classifier ]       [ Layer B: Autoencoder Anomaly ]
- Calibrated centroid/XGBoost             - Latent dimension compression
- Softmax probability P(y=c|x)            - Reconstruction error L_rec = ||x - x_hat||^2
- Predicts: Normal, DDoS, DoS, etc.       - Anomaly score a in [0.0, 1.0]
         │                                         │
         └────────────────────┬────────────────────┘
                              ▼
                 [ Layer C: Open-Set Engine ]
                 - Checks max_c P(y=c|x) >= tau_known (0.65)
                 - Checks a >= tau_anomaly (0.60)
                 - If weak confidence + high anomaly:
                   FLAG: UNKNOWN ATTACK / ZERO-DAY CANDIDATE
                              │
                              ▼
                 [ XAI Attribution Subsystem ]
                 - SHAP feature contributions
                 - LIME decision boundaries
                 - Perturbation stability testing (87% invariance)
                              │
                              ▼
                 [ Human-Approved Mitigation ]
                 - Recommendation generated
                 - Admin reviews telemetry & evidence
                 - Enforces OFP_FLOW_MOD on OpenFlow switch
```

## 3. Core API Endpoints

| Endpoint | Method | Role Required | Description |
|---|---|---|---|
| `/api/auth/login` | POST | None | Authenticates user and issues JWT |
| `/api/auth/me` | GET | Authenticated | Returns current authenticated user and RBAC profile |
| `/api/dashboard/summary` | GET | Any | Aggregates KPIs, traffic charts, attack distribution |
| `/api/traffic/realtime` | GET | Any | Real-time OpenFlow network telemetry |
| `/api/traffic/history` | GET | Any | Historical traffic trends (1H, 6H, 24H, 7D) |
| `/api/traffic/ingest` | POST | Any | Ingests new flow vector through ML pipeline |
| `/api/zero-day` | GET | Any | Returns open-set zero-day candidate incidents |
| `/api/zero-day/{id}/status`| POST | Analyst/Admin | Updates investigation status |
| `/api/xai/{id}/shap` | GET | Any | Returns SHAP feature attribution waterfall |
| `/api/xai/{id}/lime` | GET | Any | Returns LIME local surrogate explanations |
| `/api/xai/{id}/reliability`| GET | Any | Computes perturbation-based stability score |
| `/api/sdn/status` | GET | Any | Returns Ryu OpenFlow controller health |
| `/api/sdn/switches` | GET | Any | Inspects connected OpenFlow switch DPIDs |
| `/api/sdn/flows` | GET | Any | Lists installed flow table rules |
| `/api/sdn/events` | GET | Any | Real-time OpenFlow controller event stream |
| `/api/mitigation/approve`| POST | **ADMIN ONLY** | Authorizes and deploys flow suppression rule |
| `/api/mitigation/reject` | POST | Analyst/Admin | Rejects mitigation recommendation |
| `/api/adversarial/run` | POST | Researcher/Admin | Executes controlled adversarial experiment |
| `/api/reports` | GET | Any | Lists compliance and research reports |
