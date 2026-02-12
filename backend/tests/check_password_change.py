import sys
import os
import time
from fastapi.testclient import TestClient

# Path setup
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.core.config import settings

client = TestClient(app)

ORIGINAL_PASSWORD = settings.INITIAL_SUPERADMIN_PASSWORD
NEW_PASSWORD = "TempPassword123!"
EMAIL = settings.INITIAL_SUPERADMIN_EMAIL

def login(password):
    """Intenta loguearse y retorna el token si es exitoso."""
    try:
        response = client.post("/api/v1/auth/login/admin", json={
            "identifier": EMAIL,
            "password": password
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        return None
    except Exception as e:
        print(f"❌ Error Login: {e}")
        return None

def change_password(token, current_pwd, new_pwd):
    """Cambia la contraseña usando el endpoint."""
    response = client.post(
        "/api/v1/auth/change-password",
        headers={"Authorization": f"Bearer {token}"},
        json={"current_password": current_pwd, "new_password": new_pwd}
    )
    return response

def run_test():
    print("🔐 Iniciando Validación de Flujo de Cambio de Contraseña...")
    print(f"👤 Usuario: {EMAIL}")
    
    # 1. Login Inicial
    print("\n1️⃣ Probando Login con Password Original...")
    token = login(ORIGINAL_PASSWORD)
    if not token:
        print("❌ Falló el login inicial. Abortando.")
        return
    print("✅ Login inicial exitoso.")

    # 2. Cambiar Contraseña
    print(f"\n2️⃣ Cambiando contraseña a '{NEW_PASSWORD}'...")
    res = change_password(token, ORIGINAL_PASSWORD, NEW_PASSWORD)
    if res.status_code != 200:
        print(f"❌ Falló el cambio de contraseña: {res.text}")
        return
    print("✅ Cambio de contraseña exitoso.")

    # 3. Validar Nuevo Login
    print("\n3️⃣ Validando Login con Nueva Contraseña...")
    new_token = login(NEW_PASSWORD)
    if not new_token:
        print("❌ Falló el login con la nueva contraseña.")
        return
    print("✅ Login con nueva contraseña exitoso.")

    # 4. Validar que el viejo password ya no funciona
    print("\n4️⃣ Verificando que el password anterior ya no sirve...")
    if login(ORIGINAL_PASSWORD):
        print("❌ ERROR GRAVE: El password anterior sigue funcionando.")
        return
    print("✅ El password anterior fue revocado correctamente.")

    # 5. Revertir Cambios (Limpieza)
    print("\n5️⃣ Revertiendo a Password Original...")
    res = change_password(new_token, NEW_PASSWORD, ORIGINAL_PASSWORD)
    if res.status_code != 200:
        print(f"⚠️ Alerta: No se pudo revertir la contraseña. El password actual es: {NEW_PASSWORD}")
        print(f"Error: {res.text}")
    else:
        print("✅ Contraseña revertida al valor de configuración original.")

    print("\n🎉 VALIDACIÓN COMPLETADA CON ÉXITO")

if __name__ == "__main__":
    run_test()
