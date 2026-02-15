"""
Migration script to add commercial_name column to tenants table
Run this script to update existing databases with the new commercial_name field
"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ DATABASE_URL not found in environment variables")
    exit(1)

# Remove pgbouncer parameter for DDL operations
if "pgbouncer=true" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("?pgbouncer=true", "").replace("&pgbouncer=true", "")
    # Also change pooler port to direct port if needed
    DATABASE_URL = DATABASE_URL.replace(":6543/", ":5432/")
    print("🔄 Using direct connection (non-pooled) for DDL operations")

engine = create_engine(DATABASE_URL)

def add_commercial_name_column():
    """Add commercial_name column to tenants table"""
    try:
        with engine.connect() as conn:
            # Check if column already exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='tenants' AND column_name='commercial_name'
            """))
            
            if result.fetchone():
                print("✅ Column 'commercial_name' already exists in tenants table")
                return
            
            # Add the column
            conn.execute(text("""
                ALTER TABLE tenants 
                ADD COLUMN commercial_name VARCHAR
            """))
            conn.commit()
            
            print("✅ Successfully added 'commercial_name' column to tenants table")
            
            # Optionally, copy name to commercial_name for existing records
            conn.execute(text("""
                UPDATE tenants 
                SET commercial_name = name 
                WHERE commercial_name IS NULL
            """))
            conn.commit()
            
            print("✅ Populated commercial_name with existing name values")
            
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        raise

if __name__ == "__main__":
    print("🔄 Starting migration to add commercial_name column...")
    add_commercial_name_column()
    print("✅ Migration completed successfully!")
