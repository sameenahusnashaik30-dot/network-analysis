from dataclasses import dataclass
from typing import Optional

@dataclass
class User:
    id: str
    username: str
    email: str
    hashed_password: str
    role: str  # 'ADMIN', 'ANALYST', 'RESEARCHER', 'VIEWER'
    full_name: str
    is_active: bool = True
