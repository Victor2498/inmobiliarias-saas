import os
import sys
from dotenv import load_dotenv

# Forzar path
sys.path.append(os.path.join(os.getcwd(), 'app'))

# Intentar cargar .env de diferentes formas
load_dotenv()
print(f"1. Carga standard load_dotenv(): {os.getenv('INITIAL_SUPERADMIN_EMAIL')}")

base_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(base_dir, '.env'))
print(f"2. Carga absoluta {base_dir}: {os.getenv('INITIAL_SUPERADMIN_EMAIL')}")

# Verificar si hay procesos huérfanos o si el .env tiene duplicados
with open(os.path.join(base_dir, '.env'), 'r') as f:
    print("--- CONTENIDO .env ---")
    print(f.read())
    print("----------------------")

import app.core.config as config
print(f"3. Configuración en app.core.config: {config.settings.INITIAL_SUPERADMIN_EMAIL}")
