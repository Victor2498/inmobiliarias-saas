from sqlalchemy import create_engine
import os
from dotenv import load_dotenv
import sys

# Forzar salida en UTF-8
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

load_dotenv()

db_url = os.getenv("DATABASE_URL")
print(f"Testing URL: {db_url}")

try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        print("✅ Connection successful!")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
