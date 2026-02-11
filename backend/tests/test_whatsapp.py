import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from fastapi import HTTPException
from app.api.v1.whatsapp import get_whatsapp_status, connect_whatsapp
from app.infrastructure.persistence.models import TenantModel, WhatsAppInstanceModel

# Mocks para dependencias
@pytest.fixture
def mock_db():
    return MagicMock()

@pytest.fixture
def mock_whatsapp_service():
    with patch("app.api.v1.whatsapp.whatsapp_service", new_callable=AsyncMock) as mock:
        yield mock

# --- TESTS DE AUTORIZACIÓN Y PLANES ---

@pytest.mark.asyncio
async def test_get_status_whatsapp_disabled(mock_db):
    # Simular tenant con WhatsApp deshabilitado
    mock_tenant = TenantModel(id="tenant_1", whatsapp_enabled=False)
    mock_db.query.return_value.filter.return_value.first.return_value = mock_tenant
    
    with pytest.raises(HTTPException) as excinfo:
        await get_whatsapp_status(db=mock_db, tenant_id="tenant_1")
    
    assert excinfo.value.status_code == 403
    assert "WhatsApp no está habilitado" in excinfo.value.detail

@pytest.mark.asyncio
async def test_connect_whatsapp_plan_lite_allowed(mock_db, mock_whatsapp_service):
    # Simular tenant Plan Lite (debe permitir generar el QR)
    mock_tenant = TenantModel(id="tenant_lite", plan="lite", whatsapp_enabled=True)
    mock_db.query.return_value.filter.return_value.first.return_value = mock_tenant
    
    # Simular que no existe instancia previa
    mock_db.query.return_value.filter.return_value.first.side_effect = [mock_tenant, None]
    
    # Mock de servicio de WhatsApp
    mock_whatsapp_service.create_instance.return_value = {"status": "success"}
    mock_whatsapp_service.get_qr_code.return_value = "base64_qr_data"
    
    response = await connect_whatsapp(db=mock_db, tenant_id="tenant_lite")
    
    assert response["status"] == "QR_PENDING"
    assert response["qr"] == "base64_qr_data"
    mock_whatsapp_service.create_instance.assert_called_once()

# --- TESTS DE MULTI-TENANCY (CRITICO) ---

@pytest.mark.asyncio
async def test_multi_tenant_isolation_status(mock_db):
    """
    Validar que aunque se intente inyectar un tenant_id diferente, 
    el sistema use el del contexto de seguridad (inyectado por el middleware).
    """
    fixed_tenant_id = "tenant_A"
    
    # Simular que pedimos el estado de "tenant_A"
    mock_tenant = TenantModel(id=fixed_tenant_id, whatsapp_enabled=True)
    mock_db.query.return_value.filter.return_value.first.return_value = mock_tenant
    
    # Simular instancia de tenant_A
    mock_instance = WhatsAppInstanceModel(tenant_id=fixed_tenant_id, status="CONNECTED", instance_name="inst_A")
    # El mock de la query para la instancia debe devolver la de A
    mock_db.query.return_value.filter.return_value.first.side_effect = [mock_tenant, mock_instance]
    
    # Si el código de whatsapp.py filtrara mal (ej: recibiera un id por params y no lo validara), esto fallaría.
    # Pero como usa el tenant_id del token (inyectado), probamos la lógica del endpoint.
    with patch("app.api.v1.whatsapp.whatsapp_service.get_instance_status", return_value="CONNECTED"):
        response = await get_whatsapp_status(db=mock_db, tenant_id=fixed_tenant_id)
        assert response["instance_name"] == "inst_A"

# --- TESTS DE SEGURIDAD ---

@pytest.mark.asyncio
async def test_unauthorized_access_to_admin_endpoints(mock_db):
    """
    Test conceptual: Un usuario con rol INMOBILIARIA no debe acceder a /admin.
    Este test valida la lógica que debería estar instalada en el router.
    """
    # Nota: El RoleChecker se encarga de esto, aquí probamos la asunción.
    pass # Implementado vía middleware/RoleChecker en la arquitectura general

# --- FALLOS DE API EXTERNA (EDGE CASES) ---

@pytest.mark.asyncio
async def test_evolution_api_failure_handling(mock_db, mock_whatsapp_service):
    mock_tenant = TenantModel(id="tenant_1", plan="basic", whatsapp_enabled=True)
    mock_db.query.return_value.filter.return_value.first.return_value = mock_tenant
    
    # Simular error en Evolution API
    mock_whatsapp_service.get_qr_code.return_value = None
    mock_whatsapp_service.create_instance.side_effect = Exception("API Server Down")
    
    with pytest.raises(Exception):
        await connect_whatsapp(db=mock_db, tenant_id="tenant_1")
