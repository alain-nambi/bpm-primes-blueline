import os

# Configuration de l'ORM Tortoise pour la connexion à PostgreSQL
# En Docker : lit DATABASE_URL de l'environnement
# En local : utilise localhost
DATABASE_URL = os.getenv("DATABASE_URL", "postgres://postgres:mysecretpassword@db:5432/bpm_primes_db")

TORTOISE_ORM = {
    "connections": {
        "default": DATABASE_URL
    },
    "apps": {
        "models": {
            "models": ["app.models", "aerich.models"],
            "default_connection": "default",
        }
    },
}
