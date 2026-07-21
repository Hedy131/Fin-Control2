import smtplib
from email.mime.text import MIMEText

from app.core.config import settings


def send_pin_recovery_email(pin: str) -> None:
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        raise RuntimeError("SMTP não está configurado")

    to_email = settings.RECOVERY_EMAIL
    from_email = settings.SMTP_FROM or settings.SMTP_USER

    message = MIMEText(
        f"O PIN atual de acesso ao FinControl é: {pin}\n\n"
        "Se não pediu esta recuperação, ignore este email."
    )
    message["Subject"] = "FinControl — Recuperação de PIN"
    message["From"] = from_email
    message["To"] = to_email

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(from_email, [to_email], message.as_string())
