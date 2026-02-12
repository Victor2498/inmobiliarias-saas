from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.infrastructure.persistence.models import TenantModel, UserModel
from app.api.v1.schemas import TenantCreate, TenantUpdate, TenantResponse
from app.application.services.admin_service import AdminService
from app.api.deps import RoleChecker, get_current_user

router = APIRouter()
admin_only = RoleChecker(["SUPERADMIN"])

@router.post("/", response_model=Dict[str, Any])
def create_tenant(
    tenant: TenantCreate, 
    db: Session = Depends(get_db), 
    current_user: UserModel = Depends(get_current_user),
    _ = Depends(admin_only)
):
    new_tenant, error = AdminService.create_tenant(
        db, 
        name=tenant.name, 
        email=tenant.email, 
        password=tenant.password, 
        plan=tenant.plan,
        whatsapp_enabled=tenant.whatsapp_enabled,
        actor_id=current_user.id
    )
    
    if error:
        raise HTTPException(status_code=400, detail=error)
        
    return {"message": "Inmobiliaria creada con éxito", "id": new_tenant.id}

@router.get("/", response_model=List[TenantResponse])
def list_tenants(db: Session = Depends(get_db), _ = Depends(admin_only)):
    # Futura implementación de paginación aquí
    return db.query(TenantModel).all()

@router.patch("/{tenant_id}")
def update_tenant(
    tenant_id: str, 
    update_data: TenantUpdate, 
    db: Session = Depends(get_db), 
    current_user: UserModel = Depends(get_current_user),
    _ = Depends(admin_only)
):
    data = update_data.dict(exclude_unset=True)
    tenant, error = AdminService.update_tenant(
        db, 
        tenant_id=tenant_id, 
        update_data=data,
        actor_id=current_user.id
    )
    
    if error:
        raise HTTPException(status_code=404, detail=error)
        
    return {"message": "Inmobiliaria actualizada correctamente"}

@router.get("/audit", response_model=List[Dict[str, Any]])
def get_audit_logs(
    db: Session = Depends(get_db), 
    _ = Depends(admin_only)
):
    from app.infrastructure.persistence.models import AuditLogModel
    return db.query(AuditLogModel).order_by(AuditLogModel.timestamp.desc()).limit(100).all()

@router.get("/billing", response_model=List[Dict[str, Any]])
def get_billing_history(
    db: Session = Depends(get_db), 
    _ = Depends(admin_only)
):
    from app.infrastructure.persistence.models import SubscriptionHistoryModel
    return db.query(SubscriptionHistoryModel).order_by(SubscriptionHistoryModel.created_at.desc()).limit(100).all()
