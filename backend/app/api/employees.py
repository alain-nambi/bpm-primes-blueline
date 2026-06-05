import csv, io
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from typing import List, Optional
from app.models import Employee, User
from app.schemas import *
from app.auth import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.post("/", response_model=EmployeeResponse)
async def create_employee(emp: EmployeeCreate):
    obj = await Employee.create(**emp.dict())
    return await Employee.get(id=obj.id)


@router.get("/", response_model=List[EmployeeResponse])
async def list_employees(
    department: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    query = Employee.all()

    if department:
        query = query.filter(department=department)

    return await query


@router.get("/export")
async def export_employees(
    department: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    query = Employee.all().prefetch_related('manager')
    if department:
        query = query.filter(department=department)
    employees = await query

    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')
    writer.writerow(["Matricule", "Nom", "Departement", "Manager", "DateCreation"])
    for e in employees:
        writer.writerow([
            e.matricule,
            e.name,
            e.department.value,
            e.manager.name if e.manager else '',
            e.created_at.isoformat() if e.created_at else '',
        ])

    output.seek(0)
    return StreamingResponse(
        iter(['\ufeff' + output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=export_employes_{datetime.now().strftime('%Y%m%d')}.csv"}
    )


@router.get("/{emp_id}", response_model=EmployeeResponse)
async def get_employee(emp_id: int):
    return await Employee.get(id=emp_id)
