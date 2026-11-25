from datetime import datetime
from typing import List, Dict, Any

class ReportService:
    def get_reports(self) -> List[Dict[str, Any]]:
        return [
            {
                "report_id": "RPT-2026-11-01",
                "title": "Daily SDN Security & Attack Overview",
                "type": "Daily Security Report",
                "generated_at": datetime.utcnow().isoformat(),
                "author": "SENTINEL-X Automated Engine",
                "summary": "Comprehensive 24-hour summary of 24,850 flows, 128 known attacks, and 17 unknown candidate detections.",
                "download_url": "/api/reports/download/RPT-2026-11-01.csv",
            },
            {
                "report_id": "RPT-2026-11-02",
                "title": "Zero-Day Open-Set Detection Audit",
                "type": "Zero-Day Report",
                "generated_at": datetime.utcnow().isoformat(),
                "author": "Security Administrator",
                "summary": "Deep-dive into 17 unknown traffic flows flagged by Autoencoder reconstruction loss with SHAP analysis.",
                "download_url": "/api/reports/download/RPT-2026-11-02.csv",
            },
            {
                "report_id": "RPT-2026-11-03",
                "title": "Explainable AI Feature Stability Verification",
                "type": "XAI Report",
                "generated_at": datetime.utcnow().isoformat(),
                "author": "ML/SDN Researcher",
                "summary": "Perturbation analysis of SHAP and LIME feature ranking stability under controlled input variance (87% consistency).",
                "download_url": "/api/reports/download/RPT-2026-11-03.csv",
            },
            {
                "report_id": "RPT-2026-11-04",
                "title": "Adversarial Resilience Benchmark on OpenFlow Flows",
                "type": "Adversarial Robustness Report",
                "generated_at": datetime.utcnow().isoformat(),
                "author": "ML/SDN Researcher",
                "summary": "Evaluation of Random Forest and XGBoost classifiers against feature perturbation and evasion patterns.",
                "download_url": "/api/reports/download/RPT-2026-11-04.csv",
            },
        ]

report_service = ReportService()
