"""
Obtiene ICL (y opcionalmente IPC) desde API Argentina Datos.
Uso: histórico para cálculo de ajustes; puede sincronizar a tabla economic_indices.
"""
import requests
from datetime import datetime, timedelta
from typing import Optional

# URL API Argentina Datos (proyecto open source)
# Documentación: https://argentinadatos.com/
BASE_URL_ICL = "https://api.argentinadatos.com/v1/finanzas/indices/icl"
BASE_URL_IPC = "https://api.argentinadatos.com/v1/finanzas/indices/ipc"


def fetch_icl_data() -> Optional[dict]:
    """
    Obtiene el historial completo del ICL.
    Retorna un diccionario {fecha_str: valor} con fecha en YYYY-MM-DD.
    """
    try:
        response = requests.get(BASE_URL_ICL, timeout=10)
        response.raise_for_status()
        data = response.json()
        icl_map = {}
        for entry in data:
            date_str = entry.get("fecha") or entry.get("date")
            value = entry.get("valor") or entry.get("value")
            if date_str is not None and value is not None:
                if len(str(date_str)) == 10 and "T" not in str(date_str):
                    icl_map[str(date_str)[:10]] = float(value)
                else:
                    try:
                        dt = datetime.fromisoformat(str(date_str).replace("Z", "+00:00"))
                        icl_map[dt.strftime("%Y-%m-%d")] = float(value)
                    except Exception:
                        pass
        return icl_map
    except requests.exceptions.RequestException as e:
        print(f"Error conectando con la fuente de datos ICL: {e}")
        return None
    except (KeyError, TypeError, ValueError) as e:
        print(f"Error procesando respuesta ICL: {e}")
        return None


def fetch_ipc_data() -> Optional[dict]:
    """
    Obtiene historial IPC si la API lo expone (misma estructura que ICL).
    Retorna {fecha_str: valor} o None si no está disponible.
    """
    try:
        response = requests.get(BASE_URL_IPC, timeout=10)
        response.raise_for_status()
        data = response.json()
        ipc_map = {}
        for entry in data:
            date_str = entry.get("fecha") or entry.get("date")
            value = entry.get("valor") or entry.get("value")
            if date_str is not None and value is not None:
                if len(str(date_str)) == 10 and "T" not in str(date_str):
                    ipc_map[str(date_str)[:10]] = float(value)
                else:
                    try:
                        dt = datetime.fromisoformat(str(date_str).replace("Z", "+00:00"))
                        ipc_map[dt.strftime("%Y-%m-%d")] = float(value)
                    except Exception:
                        pass
        return ipc_map if ipc_map else None
    except Exception:
        return None


def get_todays_icl(icl_map: Optional[dict] = None) -> Optional[float]:
    """Devuelve el ICL del día de hoy. Si no hay mapa, lo descarga."""
    if icl_map is None:
        icl_map = fetch_icl_data()
    if not icl_map:
        return None
    today = datetime.now().strftime("%Y-%m-%d")
    if today in icl_map:
        return icl_map[today]
    for i in range(1, 4):
        past_date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        if past_date in icl_map:
            print(f"ICL no encontrado para hoy ({today}), usando {past_date}")
            return icl_map[past_date]
    return None


def get_icl_by_date(target_date_str: str, icl_map: Optional[dict] = None) -> Optional[float]:
    """ICL para una fecha YYYY-MM-DD (ideal para índice base del contrato)."""
    if icl_map is None:
        icl_map = fetch_icl_data()
    return icl_map.get(target_date_str) if icl_map else None


def sync_icl_to_db(icl_map: dict):
    """
    Inserta/actualiza registros en economic_indices (solo icl_value).
    Ejecutar desde contexto con app (Session y modelos cargados).
    """
    import os
    import sys
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if base_dir not in sys.path:
        sys.path.insert(0, base_dir)
    from datetime import date
    from app.core.database import SessionLocal
    from app.domain.models.economic_indices import EconomicIndexModel

    db = SessionLocal()
    try:
        for date_str, value in icl_map.items():
            try:
                d = date(int(date_str[:4]), int(date_str[5:7]), int(date_str[8:10]))
            except (ValueError, IndexError):
                continue
            existing = db.query(EconomicIndexModel).filter(EconomicIndexModel.date == d).first()
            if existing:
                existing.icl_value = value
            else:
                db.add(EconomicIndexModel(date=d, icl_value=value, ipc_value=None))
        db.commit()
        print(f"Sync ICL: {len(icl_map)} fechas procesadas.")
    except Exception as e:
        db.rollback()
        print(f"Error sync ICL a DB: {e}")
    finally:
        db.close()


# --- Ejemplo de uso ---
if __name__ == "__main__":
    print("Descargando índices ICL...")
    indices = fetch_icl_data()

    if indices:
        hoy_valor = get_todays_icl(indices)
        print(f"ICL Hoy: {hoy_valor}")

        fecha_inicio = "2024-02-15"
        alquiler_base = 100000
        icl_base = get_icl_by_date(fecha_inicio, indices)

        if icl_base and hoy_valor:
            coeficiente = hoy_valor / icl_base
            nuevo_alquiler = alquiler_base * coeficiente
            print("--- Simulación de Ajuste ---")
            print(f"Fecha Inicio: {fecha_inicio} (ICL: {icl_base})")
            print(f"Fecha Actual: {datetime.now().strftime('%Y-%m-%d')} (ICL: {hoy_valor})")
            print(f"Coeficiente: {coeficiente:.4f}")
            print(f"Alquiler Base: ${alquiler_base}")
            print(f"Nuevo Alquiler: ${nuevo_alquiler:.2f}")
        else:
            print("No se encontraron índices para las fechas solicitadas.")

        # Opcional: sincronizar a DB (descomentar si quieres poblar economic_indices)
        # sync_icl_to_db(indices)
    else:
        print("No se pudo obtener datos ICL.")
