from fastapi import APIRouter, Depends
from typing import List
from app.models import User
from app.schemas import UserResponse
from app.auth import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/", response_model=List[UserResponse])
async def list_users():
    return await User.all()
