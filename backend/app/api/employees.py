# Imports FastAPI pour les routes et les erreurs
from fastapi import APIRouter, Depends
# Imports de typage
from typing import List, Optional
# Imports des modèles
from app.models import Employee
# Imports des schémas
from app.schemas import *
# Import de l'auth
from app.auth import get_current_user

# Création du routeur API
router = APIRouter(dependencies=[Depends(get_current_user)])


# Route POST pour créer un employé
@router.post("/", response_model=EmployeeResponse)
async def create_employee(emp: EmployeeCreate):
    # Création de l'employé
    obj = await Employee.create(**emp.dict())
    return await Employee.get(id=obj.id)

# Route GET pour lister les employés (filtre par département optionnel)
@router.get("/", response_model=List[EmployeeResponse])
async def list_employees(department: Optional[str] = None):
    query = Employee.all()
    if department: query = query.filter(department=department)
    return await query


@router.get("/{emp_id}", response_model=EmployeeResponse)
async def get_employee(emp_id: int):
    return await Employee.get(id=emp_id)