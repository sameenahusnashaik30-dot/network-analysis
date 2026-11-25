# SENTINEL-X: Product Requirements Document (PRD)

## 1. Product Vision & Goals

SENTINEL-X is an intelligent SDN cybersecurity monitoring and zero-day attack detection platform. Operating at the interface of software-defined networking datapaths (OpenFlow 1.3) and hybrid machine learning, the system addresses the fundamental vulnerability of closed-world network intrusion detectors: **the tendency of traditional models to force unfamiliar, novel attacks into preexisting attack categories.**

The system classifies traffic into five distinct operational states:
1. **NORMAL**: Traffic conforming with calibrated baseline behavior across packet rate, port distribution, and TCP flags.
2. **KNOWN ATTACK**: Signatures strongly matching verified supervised classifiers (DDoS, DoS, Port Scan, Brute Force, Botnet, Web Attack).
3. **SUSPICIOUS**: Ambiguous or borderline flow metrics requiring elevated telemetry observation.
4. **UNKNOWN ATTACK**: Anomalous traffic exhibiting statistically high Autoencoder reconstruction loss but lacking high softmax confidence in any known signature class.
5. **ZERO-DAY CANDIDATE**: High-severity, high-entropy unknown flows exhibiting extreme deviation from normal manifolds and anomalous SDN controller events.

**Non-Negotiable Principle**: The system must NOT force unfamiliar traffic into a known class. If confidence is insufficient, it designates `UNKNOWN / REQUIRES INVESTIGATION`.

---

## 2. Core User Personas & Permissions (RBAC)

### 1. Security Administrator (`ADMIN`)
- **Privileges**: Full SOC access, network telemetry monitoring, incident investigation, XAI analysis, and **exclusive authorization** for SDN mitigation (`Approve & Block`, `Quarantine`, `Rate Limit`).
- **Safety Rule**: Destructive network actions are never executed silently by the AI. Enactment requires authenticated human approval.

### 2. Security Analyst (`ANALYST`)
- **Privileges**: Alert triage, network flow inspection, SHAP/LIME explanation analysis, incident status transitions (`CONFIRMED`, `FALSE POSITIVE`, `CLOSED`). Cannot directly deploy destructive OpenFlow flow rules.

### 3. Machine Learning / SDN Researcher (`RESEARCHER`)
- **Privileges**: Model benchmark evaluation, explanation stability auditing, controlled defensive adversarial testing (feature noise, evasion, timing jitter), and experimental metrics export.

### 4. SOC Dashboard Viewer (`VIEWER`)
- **Privileges**: Read-only telemetry and KPI observation.

---

## 3. Product Features Summary

### Feature 1 — Real-Time Network Monitoring
- Monitored metrics: Total flows, active flows, packets/sec, bytes/sec, protocol breakdown (TCP, UDP, ICMP), top source/destination IPs, destination ports, flow duration, and wire throughput.
- Visual timeline with time controls: `1H`, `6H`, `24H`, `7D`.
- Transparency rule: If live data is unavailable, clearly mark `DEMO DATA ACTIVE`.

### Feature 2 — Hybrid AI Architecture
- **Layer A (Known Attack Classifier)**: Configurable multi-class model (Random Forest / XGBoost) with test accuracy $\ge 97\%$.
- **Layer B (Anomaly Detector)**: Autoencoder reconstruction model computing $\mathcal{L}_{rec} = \|x - \hat{x}\|^2$ with configurable anomaly threshold $\tau_{anomaly}$.
- **Layer C (Open-Set Detection)**: Prevents closed-world misclassification by checking maximum probability $\max_c P(y=c|x) < \tau_{known}$ against reconstruction loss.

### Feature 3 — Zero-Day Candidate Workspace
- Dedicated page tracking unknown candidates, suspicion score, confidence, first/last seen timestamps, full 5-tuple flow metrics, and lifecycle state (`NEW`, `INVESTIGATING`, `CONFIRMED`, `FALSE POSITIVE`, `MITIGATED`, `CLOSED`).
- Multi-dimensional pattern comparison against known baseline centroids.

### Feature 4 & 5 — Explainable AI (SHAP & LIME) and Stability
- **SHAP**: Additive Shapley feature importance waterfall showing top positive and negative contributors (Packet Rate, Destination Port, Duration, Byte Volume, Flag Entropy).
- **LIME**: Local surrogate decision rules in human-readable terms.
- **Explanation Reliability**: Mathematical verification of explanation stability (e.g. 87% score) under $\pm 5\%$ Gaussian perturbation.

### Feature 6 & 7 — SDN Controller Integration & Attack Correlation
- Ryu OpenFlow 1.3 monitoring: Controller status, OpenFlow protocol health, connected switch DPIDs, active flow rules, packet-in frequency spikes, flow-mod installations, and controller latency.
- Correlation timeline linking data-plane packet anomalies with control-plane OpenFlow signaling surges.

### Feature 8 — Controlled Adversarial Resilience
- Controlled defensive benchmarking against feature perturbation, traffic timing evasion, and payload morphing.
- Reports baseline vs perturbed performance (Accuracy, Detection Rate, False Positive Rate, Performance Degradation, and Robustness Score).

### Feature 9 & 10 — Human-in-the-Loop Mitigation & Incident Triage
- Recommendation-only by default.
- Modal verification showing Source, Destination, Protocol, AI confidence, Reason, and Action choices (`BLOCK_FLOW`, `QUARANTINE_FLOW`, `RATE_LIMIT`).
- Every mitigation creates an immutable entry in the security audit log.

### Feature 11 & 12 — Reports & Settings
- Exportable audit reports for Daily Security, Zero-Day Candidates, Attack Summaries, XAI Stability, and Adversarial Benchmarks in CSV and printable PDF formats.
- Comprehensive settings for AI thresholds, SDN URL, database status, and demo mode.
