from tortoise import BaseDBAsyncClient

RUN_IN_TRANSACTION = True


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "user" ALTER COLUMN "department" TYPE VARCHAR(100);
        ALTER TABLE "employee" ALTER COLUMN "department" TYPE VARCHAR(100);
        ALTER TABLE "primemax" ALTER COLUMN "department" TYPE VARCHAR(100);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "primemax" ALTER COLUMN "department" TYPE VARCHAR(21);
        ALTER TABLE "employee" ALTER COLUMN "department" TYPE VARCHAR(21);
        ALTER TABLE "user" ALTER COLUMN "department" TYPE VARCHAR(21);"""
