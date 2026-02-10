from app.core.config import settings
from sqlalchemy import create_engine
from app.infrastructure.persistence.models import Base
from app.infrastructure.persistence.business_models import Base as BusinessBase

def init_db():
    print("Iniciando creación de tablas...")
    engine = create_engine(settings.get_database_url)
    # Esto creará todas las tablas definidas en los modelos que hereden de Base
    Base.metadata.create_all(bind=engine)
    print("Tablas de sistema creadas.")
    
    # También nos aseguramos de que el archivo business_models sea registrado si usa otra Base, 
    # pero aquí ambos usan la misma Base de persistence.models habitualmente.
    # Si business_models importa Base de models.py, con una sola llamada basta.
    
    print("Base de datos inicializada exitosamente.")

if __name__ == "__main__":
    init_db()
