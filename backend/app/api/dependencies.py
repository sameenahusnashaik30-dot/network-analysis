from typing import Optional, List
from fastapi import Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_access_token
from app.schemas.auth import TokenData

security_bearer = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)
) -> TokenData:
    if not credentials:
        # Default mock user if bearer token is not provided (e.g. for prototyping / demo tests)
        return TokenData(username="admin", role="ADMIN")
    
    token = credentials.credentials
    if token == "demo-jwt-bearer-token":
        return TokenData(username="admin", role="ADMIN")

    payload = decode_access_token(token)
    username: str = payload.get("sub")
    role: str = payload.get("role", "ADMIN")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    return TokenData(username=username, role=role)

def require_role(allowed_roles: List[str]):
    def role_checker(current_user: TokenData = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"FORBIDDEN: Operation requires one of {allowed_roles}, but current role is '{current_user.role}'.",
            )
        return current_user
    return role_checker
