import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")

sql_commands = [
    "ALTER TABLE tenants ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'active';",
    "ALTER TABLE tenants ADD COLUMN IF NOT EXISTS last_billing_sync TIMESTAMP;",
    """
    CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR PRIMARY KEY,
        actor_id INTEGER REFERENCES users(id),
        tenant_id VARCHAR REFERENCES tenants(id),
        action VARCHAR,
        details JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS subscription_history (
        id SERIAL PRIMARY KEY,
        tenant_id VARCHAR REFERENCES tenants(id),
        plan_id VARCHAR,
        amount FLOAT,
        currency VARCHAR DEFAULT 'ARS',
        payment_status VARCHAR,
        billing_cycle_start TIMESTAMP,
        billing_cycle_end TIMESTAMP,
        transaction_id VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
]

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    for command in sql_commands:
        print(f"Ejecutando: {command[:50]}...")
        cur.execute(command)
    conn.commit()
    cur.close()
    conn.close()
    print("✅ Base de datos actualizada con éxito.")
except Exception as e:
    print(f"❌ Error aplicando hotfix: {e}")
