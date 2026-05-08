from tortoise import BaseDBAsyncClient

RUN_IN_TRANSACTION = True


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        COMMENT ON COLUMN "bonus"."status" IS 'INITIALISE: Initialisé
EN_ATTENTE_N1: En attente N+1
EN_ATTENTE_DIRECTEUR: En attente Directeur
EN_ATTENTE_DG: En attente DG
EN_ATTENTE_DRH: En attente DRH
VALIDE: Prime validée
REJETE: Prime rejetée';
        COMMENT ON COLUMN "employee"."department" IS 'CLIENTELE: Clientèle
COMMERCIAL_GP: Commercial GP
COMMERCIAL_ENTREPRISE: Commercial entreprise
ADV: ADV
FIDELISATION: Fidélisation
AUDITEUR_INTERNE: Auditeur interne
DAF_CONTROLEUR: DAF Contrôleur
DAF_CDG: DAF CDG
CTB: CTB
RH: RH
ACHAT: Achat
BBS: BBS
COMM_MKTG: Communication & Mktg
DO: DO
DSI: DSI
DT: DT
LOGISTIQUE: Logistique
DG: DG';
        COMMENT ON COLUMN "primemax"."department" IS 'CLIENTELE: Clientèle
COMMERCIAL_GP: Commercial GP
COMMERCIAL_ENTREPRISE: Commercial entreprise
ADV: ADV
FIDELISATION: Fidélisation
AUDITEUR_INTERNE: Auditeur interne
DAF_CONTROLEUR: DAF Contrôleur
DAF_CDG: DAF CDG
CTB: CTB
RH: RH
ACHAT: Achat
BBS: BBS
COMM_MKTG: Communication & Mktg
DO: DO
DSI: DSI
DT: DT
LOGISTIQUE: Logistique
DG: DG';
        ALTER TABLE "user" ADD "password_hash" VARCHAR(255);
        COMMENT ON COLUMN "user"."department" IS 'CLIENTELE: Clientèle
COMMERCIAL_GP: Commercial GP
COMMERCIAL_ENTREPRISE: Commercial entreprise
ADV: ADV
FIDELISATION: Fidélisation
AUDITEUR_INTERNE: Auditeur interne
DAF_CONTROLEUR: DAF Contrôleur
DAF_CDG: DAF CDG
CTB: CTB
RH: RH
ACHAT: Achat
BBS: BBS
COMM_MKTG: Communication & Mktg
DO: DO
DSI: DSI
DT: DT
LOGISTIQUE: Logistique
DG: DG';"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "user" DROP COLUMN "password_hash";
        COMMENT ON COLUMN "user"."department" IS 'CLIENTELE: Clientèle
COMMERCIAL_GP: Commercial GP
COMMERCIAL_ENTREPRISE: Commercial entreprise
ADV: ADV
FIDELISATION: Fidélisation
AUDITEUR_INTERNE: Auditeur interne
DAF_CONTROLEUR: DAF Contrôleur
DAF_CDG: DAF CDG
CTB: CTB
RH: RH
ACHAT: Achat
BBS: BBS
COMM_MKTG: Communication & Mktg
DO: DO
DSI: DSI
DT: DT
LOGISTIQUE: Logistique
DIR_GENERALE: Dir générale';
        COMMENT ON COLUMN "bonus"."status" IS 'INITIALISE: Initialisé
EN_ATTENTE_N1: En attente N+1
EN_ATTENTE_DIRECTEUR: En attente Directeur
EN_ATTENTE_DG: En attente DG
VALIDE: Validé
REJETE: Rejeté';
        COMMENT ON COLUMN "employee"."department" IS 'CLIENTELE: Clientèle
COMMERCIAL_GP: Commercial GP
COMMERCIAL_ENTREPRISE: Commercial entreprise
ADV: ADV
FIDELISATION: Fidélisation
AUDITEUR_INTERNE: Auditeur interne
DAF_CONTROLEUR: DAF Contrôleur
DAF_CDG: DAF CDG
CTB: CTB
RH: RH
ACHAT: Achat
BBS: BBS
COMM_MKTG: Communication & Mktg
DO: DO
DSI: DSI
DT: DT
LOGISTIQUE: Logistique
DIR_GENERALE: Dir générale';
        COMMENT ON COLUMN "primemax"."department" IS 'CLIENTELE: Clientèle
COMMERCIAL_GP: Commercial GP
COMMERCIAL_ENTREPRISE: Commercial entreprise
ADV: ADV
FIDELISATION: Fidélisation
AUDITEUR_INTERNE: Auditeur interne
DAF_CONTROLEUR: DAF Contrôleur
DAF_CDG: DAF CDG
CTB: CTB
RH: RH
ACHAT: Achat
BBS: BBS
COMM_MKTG: Communication & Mktg
DO: DO
DSI: DSI
DT: DT
LOGISTIQUE: Logistique
DIR_GENERALE: Dir générale';"""


MODELS_STATE = (
    "eJztnFtz0zgUgP+KJw87MNtlmmwLbN6cxC2GXLqJyzIQxqM4amqwpWDL0A7Df98j+RLfid"
    "O0TRq/QCqdI0ufrufo2D8bNp1jy33RocRzG23pZ4MgG8OPZMaR1EDL5SqZJzA0s4TkLBKZ"
    "ucxBBoPEK2S5GJLm2DUcc8lMSiCVeJbFE6kBgiZZrJI8Yn7zsM7oArNr7EDGp8+QbJI5vs"
    "Fu+Ofyq35lYmueqKg5588W6Tq7XYo0lbAzIcifNtMNank2WQkvb9k1JZG0SRhPXWCCHcQw"
    "L545Hq8+r13QzLBFfk1XIn4VYzpzfIU8i8WauyYDgxLOD2rj98SCP+WvVvPk1cnrv1+evA"
    "YRUZMo5dUvv3mrtvuKgsBQa/wS+YghX0JgjHcwYdcV0EXyv6cXsirDFyas+K3GzC4BXAG7"
    "xcipwCsUP1RcYlnwm52B1r1GjkI8W5BToRqIGDhDMFlCiiNU/UE5NgbKcHKp9NuSjYnrYW"
    "tK5Ik2VqDhSltCUB0MJPGUdEeDgTqZqKNhWzKobZuuy0tYrw9sdKNbmCxgprWl5nEJ8Pfy"
    "uPtGHj9rHj/nZVNYeP3leBjktERWsk+W2Lmijs1p665BnZyu6WHDtJGVP6Zz9VMdM/cLeB"
    "EUtEYnBQvnA471Eq49pasO5P6z06OWAOt+s0yG48RPMlhh48OAxK2wOsRVNlohHh7athcI"
    "BzPkVNm8VwoHSmzpmDbWg/VHRzb1/IZXmcEFRTzNSdysMovJTP9CPcfVo8W8wtjMVz7Qcc"
    "qQdyNwVBycCb0nOiKPK4xIf7JGI+ouMz6vkCdKuMqcN5DuYGSZbtWTUFKxJsmB0NkXbDDz"
    "qjrKuGbN0l8Hk7ZD1VU0qf00mVYanhGPzVbRXP2nibXaUKUMbXgUTavemeYjOE22jdNliH"
    "k5duR6DpOV9sM5S+BIbDKT74RT7/gY/9PIwIQDoqqpcl+dKG0pJT0lylCXNU0Zaoo+bLYl"
    "hUiIMQwHFWn4ZzOR3VPHSldTLscJqZ7pwNaBPScpe54UOk/mjt8ks8dvpuQ91LAHNbzg5y"
    "XpO9Rx7tcRT8lYeatoUZ6Dv2AW5G3i12mt49dpFft1WtnVDc4i0K06ypuDkMOg2gXrWkIz"
    "PQUD1Rfhj92chA1ow3xErNtgRS2hq6kDZaLJgwveEtuFKSkQyZrCc1oi9TaV+uxlqieiQq"
    "T/VO2NxP+UPo6GiiBIXbZwxBNXctrHBq8T8hjVCf2ho3nsviBMDcEkOtZbzjfs2KRm3bGP"
    "2rFB5bMTdnarV7q/yugd6u0CtpcWvcW4Gr6U1iHB4/enV19zbwJDKlmQZ9TB5oK8w7eZg0"
    "eKXXBdrMSK2j2Ov8LxEKauJquDfkR3y+lhAs2ExmH/7NaVJ125pzQKpvMWGF66+GGvtrbO"
    "L7NK5RPkQ3KGjK8/kDPXC8amOIchXtGcU3EnUD57N8aWECqm+j4qaL/YCkq0RWN0EtyyWX"
    "bLTqcgghai1vzZ/Enp6ZoT+RGfysXBH/G1o47/2LVF/0gqif9A8HzDswqu5wuCQOJK2zEy"
    "751jwvY6Xcf2Oi22vU6z10bIroQwlH/keIYN+bVOT9cxXk9Pi61XnpdEOMdL5DAb57mQ1v"
    "N8JEt47FCRbl/lfoa+0pa6lgmVEs6C11YQHaKMu6rc188vIJvaNnYME1nS+UUiFwoYKxdj"
    "4TSJSUFhDl46pgtlyb33bQn+mZIztaf01YmsiaiTs9BzYZmu2PFA9LKncteJzsNVxkMoU/"
    "bmJnebSPxSyCFQXE8+07sjeOyoL5ws8Dc8GZ7HC7s6sYSPRQhx74rI5X6VrtaBGmqdKeFe"
    "Fe5JkaGjNXiCcY3YlHQ6k7YE//it0wfvtHO/RQDaENWT/pAGX9kCCh9BuSP4f6LCj4kKv6"
    "CcnjYl/dG5OtHUfy+h5n26MF3GOwnyeU3ON3LCNNcZx83iYdysnTBP0lbPOmH845NTzdRM"
    "KtWWZpxkbSRlBsjmFpKIksyLPatiHUVh3vvD814NI+HoH6CbRo5hFOWVGkYi7MIOpGrDaM"
    "fWqDLDqD6N1qfR/T+N1uH3uxd+v1GYRB0gUV+IPjkjK3Mh6mJW+TI0oXNAodYlBpaP5OHs"
    "q0cLYPuteZUYHFWtq/s0LQTZHLMiJF5sUnihRG1O7NiMLDMnwAg0rSoXBJHCPt6v3Mv9QH"
    "3FcmeEfLeuxDBS2AjiI2ysB3JNtTWytV/gIP0CpqsHMTXU0Ukzx21MqYURKdjXs9qpUTwD"
    "9ftaZauedta3RTujUT9hKHVULcX0ctBRwN5PWarZyERANA9j0qvTTajWaLNonZxvlvwWqp"
    "P34ZIaJ5BZbEBzUcPMeTcfue4PCsbhNXJzhmjJQSutWB+46oiKxlNy9vkRFRmvVX25XXK5"
    "nfeuwx0x7GdsfvaDCLDu3JFE/AZ/59bVtUDUYfH36aKNQclx1CaRFbtrvyflaqftNvfGe3"
    "baugwvqxziQvn99DhuPygeBnruhyuKCa409pPh9l/qJjTPY6vhm6JPUNG9ctiWHWeVD1ri"
    "JBtiejaQPzxPnGb7o+F5KB7D2u2POimcNmXmlS7e3a9CNaVWw82FG+x1G9lqad3aWtsBay"
    "0bSlbpKBFXOaTY95w5QSu+OJBWOyR8JZEt0VfG7xjYsofOgKNUaEt8cv3+3fRoPG0B3v6/"
    "dZGeXbsUGSRjxzSuGzkmZ5BzVGZuopVMbWru2Lp2VGJqfsdO/kf+im2lmMqeGkv3cVvAp0"
    "YFiIH4fgJsHq8XnF4WnZ7zjUTCcoNb3k5Gw4J7lpVKCuQlgQZ+mpsGO5Is02WfdxNrCUXe"
    "6nJDKW0TpY7evIBO3qnmIbeXX/8D3QTPTg=="
)
