# Import de FastAPI pour créer l'application web
from fastapi import FastAPI
# Import de l'extension Tortoise pour FastAPI (gestion auto de l'ORM)
from tortoise.contrib.fastapi import register_tortoise
# Import de la config de base de données
from app.db_config import TORTOISE_ORM
# Import des routes API
from app.api import endpoints, employees, auth_routes, users

# Création de l'instance FastAPI avec titre et version
app = FastAPI(title="BPM Primes API", version="1.0.0")

# Inclusion des routes de l'API avec préfixe /api/v1
app.include_router(endpoints.router, prefix="/api/v1")
app.include_router(employees.router, prefix="/api/v1/employees")
app.include_router(users.router, prefix="/api/v1/users")
app.include_router(auth_routes.router, prefix="/api/v1/auth")

# Enregistrement de Tortoise ORM avec FastAPI :
# - Pas de generate_schemas ici (on utilise Aerich en Docker)
# - Gère les erreurs de base de données
register_tortoise(
    app,
    config=TORTOISE_ORM,
    add_exception_handlers=True,
)
