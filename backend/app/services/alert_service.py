from typing import List, Dict, Any
from app.database.repositories.incident_repository import IncidentRepository
from app.models.incident import Incident

class IncidentService:
    def __init__(self):
        self.repo = IncidentRepository()

    def get_all(self) -> List[Incident]:
        return self.repo.get_all()

    def get_by_id(self, incident_id: str) -> Incident:
        return self.repo.get_by_id(incident_id)

    def get_zero_day_threats(self) -> List[Incident]:
        incidents = self.repo.get_all()
        return [i for i in incidents if i.is_zero_day_candidate or i.classification in ["Unknown Attack", "Zero-Day Candidate"]]

    def get_known_attacks(self) -> List[Incident]:
        incidents = self.repo.get_all()
        return [i for i in incidents if not i.is_zero_day_candidate]

incident_service = IncidentService()
