import smtplib
import os
from email.message import EmailMessage

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.blueline.mg")
SMTP_PORT = int(os.getenv("SMTP_PORT", "25"))
SMTP_USER = os.getenv("SMTP_USER", "zato@staff.blueline.mg")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "GlpK@-5F")
FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "bpm@si.blueline.mg")
FROM_NAME = os.getenv("SMTP_FROM_NAME", "BPM | Gestion de Prime")


def send_reset_email(to_email: str, reset_link: str) -> bool:
    try:
        msg = EmailMessage()
        msg["Subject"] = "Réinitialisation de votre mot de passe - BPM Primes"
        msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
        msg["To"] = to_email
        msg.set_content(
            f"Bonjour,\n\n"
            f"Vous avez demandé la réinitialisation de votre mot de passe.\n\n"
            f"Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :\n"
            f"{reset_link}\n\n"
            f"Ce lien est valable 15 minutes.\n\n"
            f"Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.\n\n"
            f"---\n"
            f"BPM | Gestion de Prime"
        )

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)

        return True
    except Exception as e:
        print(f"SMTP error: {e}")
        return False
