from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.models import PrimeMax, User
from app.schemas import *
from app.auth import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.post("/", response_model=PrimeMaxResponse)
async def create_primemax(data: PrimeMaxCreate, user: User = Depends(get_current_user)):
    if not (user.is_dg or user.is_drh) and data.department != user.department:
        raise HTTPException(403, "Vous ne pouvez créer un plafond que pour votre propre département")
    existing = await PrimeMax.filter(
        department=data.department,
        bonus_type=data.bonus_type
    ).first()
    if existing:
        existing.amount = data.amount
        await existing.save()
        return existing

    obj = await PrimeMax.create(**data.dict())
    return obj


@router.get("/", response_model=List[PrimeMaxResponse])
async def list_primemax(
    department: Optional[str] = None,
    bonus_type: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    query = PrimeMax.all()
    if not (user.is_dg or user.is_drh) and user.department:
        query = query.filter(department=user.department)
    if department:
        query = query.filter(department=department)
    if bonus_type:
        query = query.filter(bonus_type=bonus_type)
    return await query


@router.get("/{pm_id}", response_model=PrimeMaxResponse)
async def get_primemax(pm_id: int, user: User = Depends(get_current_user)):
    obj = await PrimeMax.get(id=pm_id)
    if not (user.is_dg or user.is_drh) and obj.department != user.department:
        raise HTTPException(403, "Vous ne pouvez voir que les plafonds de votre département")
    return obj


@router.put("/{pm_id}", response_model=PrimeMaxResponse)
async def update_primemax(pm_id: int, data: PrimeMaxCreate, user: User = Depends(get_current_user)):
    obj = await PrimeMax.get(id=pm_id)
    if not (user.is_dg or user.is_drh) and obj.department != user.department:
        raise HTTPException(403, "Vous ne pouvez modifier que les plafonds de votre département")
    obj.amount = data.amount
    await obj.save()
    return obj


@router.delete("/{pm_id}")
async def delete_primemax(pm_id: int, user: User = Depends(get_current_user)):
    obj = await PrimeMax.get(id=pm_id)
    if not (user.is_dg or user.is_drh) and obj.department != user.department:
        raise HTTPException(403, "Vous ne pouvez supprimer que les plafonds de votre département")
    await obj.delete()
    return {"message": "Plafond supprimé"}
