from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.auth import UserLogin, Token, UserResponse, TokenData
from app.core.security import create_access_token, verify_password, get_password_hash
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

MOCK_USERS = {
    "admin": {
        "id": "USR-001",
        "username": "admin",
        "email": "secops@sentinel-x.lan",
        "role": "ADMIN",
        "full_name": "Security Administrator",
        "password_hash": get_password_hash("AdminPass2026!"),
    },
    "analyst": {
        "id": "USR-002",
        "username": "analyst",
        "email": "analyst@sentinel-x.lan",
        "role": "ANALYST",
        "full_name": "SOC Security Analyst",
        "password_hash": get_password_hash("AnalystPass2026!"),
    },
    "researcher": {
        "id": "USR-003",
        "username": "researcher",
        "email": "researcher@sentinel-x.lan",
        "role": "RESEARCHER",
        "full_name": "ML/SDN Researcher",
        "password_hash": get_password_hash("ResearcherPass2026!"),
    },
    "viewer": {
        "id": "USR-004",
        "username": "viewer",
        "email": "viewer@sentinel-x.lan",
        "role": "VIEWER",
        "full_name": "SOC Dashboard Observer",
        "password_hash": get_password_hash("ViewerPass2026!"),
    },
}

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    username_lower = credentials.username.strip().lower()
    user = MOCK_USERS.get(username_lower)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username. Please check your credentials.",
        )
    
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password. Please check your credentials.",
        )

    access_token = create_access_token(data={"sub": user["username"], "role": user["role"]})
    return Token(
        access_token=access_token,
        token_type="bearer",
        role=user["role"],
        username=user["username"],
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: TokenData = Depends(get_current_user)):
    user_info = MOCK_USERS.get(current_user.username.lower(), {
        "id": "USR-GENERIC",
        "username": current_user.username,
        "email": f"{current_user.username}@sentinel-x.lan",
        "role": current_user.role,
        "full_name": f"{current_user.username.title()} User",
    })
    return UserResponse(
        id=user_info["id"],
        username=user_info["username"],
        email=user_info["email"],
        role=user_info["role"],
        full_name=user_info["full_name"],
    )
