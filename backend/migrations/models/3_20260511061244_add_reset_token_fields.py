from tortoise import BaseDBAsyncClient

RUN_IN_TRANSACTION = True


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "user" ADD "reset_token_expires" TIMESTAMPTZ;
        ALTER TABLE "user" ADD "reset_token" VARCHAR(255);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "user" DROP COLUMN "reset_token_expires";
        ALTER TABLE "user" DROP COLUMN "reset_token";"""


MODELS_STATE = (
    "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"
)
