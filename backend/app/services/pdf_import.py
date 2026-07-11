import os
import re
from typing import List

import pypdfium2 as pdfium
import pytesseract

from app.core.config import settings
from app.schemas.import_pdf import ExtractedTransactionRow

if settings.TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
if settings.TESSDATA_PREFIX:
    os.environ["TESSDATA_PREFIX"] = settings.TESSDATA_PREFIX

OCR_LANG = "por"
OCR_CONFIG = "--psm 4"

TXN_RE = re.compile(
    r"^(?P<mov_date>\d{2}-\d{2}-\d{4})\s+"
    r"(?P<operation>\S+)\s+"
    r"(?P<trans_date>\d{2}-\d{2}-\d{4})\s+"
    r"(?P<doc>\S+)\s+"
    r"(?P<description>.+?)\s+"
    r"(?P<amount>-?\d[\d.,]*\d)\s+"
    r"(?P<balance>\d[\d.,]*\d)\s+"
    r"(?P<currency>[A-Z]{3})\s*$"
)

# Rodapé/publicidade que aparece em todas as páginas do extrato — nunca é uma transação.
STOP_MARKERS = (
    "processado por computador",
    "atlantico direct",
    "eupago",
    "cidade financeira",
    "contact centre",
    "baixe agui",
    "baixe aqui",
    "www,atlantico",
    "www.atlantico",
)


def _parse_money(raw: str) -> float:
    """Os separadores de milhar/decimal por vezes trocam no OCR ('.' <-> ',').
    Os dois últimos dígitos são sempre os cêntimos; ignoramos o carácter usado."""
    raw = raw.strip()
    negative = raw.startswith("-")
    raw = raw.lstrip("+-")
    match = re.match(r"^(.*)[.,](\d{2})$", raw)
    if match:
        integer_part = re.sub(r"[.,]", "", match.group(1)) or "0"
        decimals = match.group(2)
    else:
        integer_part = re.sub(r"[.,]", "", raw) or "0"
        decimals = "00"
    value = float(f"{integer_part}.{decimals}")
    return -value if negative else value


def _iso_date(ddmmyyyy: str) -> str:
    day, month, year = ddmmyyyy.split("-")
    return f"{year}-{month}-{day}"


def _parse_page_text(text: str) -> List[dict]:
    rows: List[dict] = []
    current = None
    continuations = 0
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        match = TXN_RE.match(line)
        if match:
            if current:
                rows.append(current)
            amount = _parse_money(match.group("amount"))
            current = {
                "date": _iso_date(match.group("trans_date")),
                "description": match.group("description").strip(),
                "amount": round(abs(amount), 2),
                "type": "income" if amount > 0 else "expense",
            }
            continuations = 0
            continue
        low = line.lower()
        if any(marker in low for marker in STOP_MARKERS):
            continue
        # Cada transação tem no máximo uma linha de descrição adicional neste formato.
        if current is not None and continuations < 1:
            current["description"] = f"{current['description']} {line}".strip()
            continuations += 1
    if current:
        rows.append(current)
    return rows


def extract_transactions_from_pdf(pdf_bytes: bytes, category_names: List[str]) -> List[ExtractedTransactionRow]:
    pdf = pdfium.PdfDocument(pdf_bytes)
    try:
        rows: List[dict] = []
        for index in range(len(pdf)):
            page = pdf[index]
            bitmap = page.render(scale=300 / 72)
            image = bitmap.to_pil()
            text = pytesseract.image_to_string(image, lang=OCR_LANG, config=OCR_CONFIG)
            rows.extend(_parse_page_text(text))
    except pytesseract.TesseractNotFoundError as e:
        raise ValueError(
            "O motor de OCR (Tesseract) não está instalado no servidor."
        ) from e
    finally:
        pdf.close()

    if not rows:
        raise ValueError(
            "Não foi possível reconhecer nenhuma transação neste PDF. "
            "Verifique se é um extrato bancário legível."
        )

    return [ExtractedTransactionRow(**row) for row in rows]
