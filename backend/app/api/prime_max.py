from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.models import PrimeMax
from app.schemas import *
from app.auth import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.post("/", response_model=PrimeMaxResponse)
async def create_primemax(data: PrimeMaxCreate):
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
    bonus_type: Optional[str] = None
):
    query = PrimeMax.all()
    if department:
        query = query.filter(department=department)
    if bonus_type:
        query = query.filter(bonus_type=bonus_type)
    return await query


@router.get("/{pm_id}", response_model=PrimeMaxResponse)
async def get_primemax(pm_id: int):
    return await PrimeMax.get(id=pm_id)


@router.put("/{pm_id}", response_model=PrimeMaxResponse)
async def update_primemax(pm_id: int, data: PrimeMaxCreate):
    obj = await PrimeMax.get(id=pm_id)
    obj.amount = data.amount
    await obj.save()
    return obj


@router.delete("/{pm_id}")
async def delete_primemax(pm_id: int):
    obj = await PrimeMax.get(id=pm_id)
    await obj.delete()
    return {"message": "Plafond supprimé"}
