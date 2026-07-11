import io
import re
import unicodedata
from datetime import date, datetime
from typing import Dict, List, Optional

import openpyxl

from app.models.account import Account
from app.models.category import Category
from app.models.enums import TransactionType
from app.schemas.import_xlsx import ImportPreviewRow

HEADER_MAP = {
    "data": "date",
    "descricao": "description",
    "valor": "amount",
    "tipo": "type",
    "conta": "account",
    "contaorigem": "account",
    "categoria": "category",
    "contadestino": "destination_account",
}

TYPE_LABELS: Dict[str, TransactionType] = {
    "receita": TransactionType.income,
    "despesa": TransactionType.expense,
    "investimento": TransactionType.investment,
    "transferencia": TransactionType.transfer,
    "poupanca": TransactionType.savings,
    "income": TransactionType.income,
    "expense": TransactionType.expense,
    "investment": TransactionType.investment,
    "transfer": TransactionType.transfer,
    "savings": TransactionType.savings,
}

REQUIRED_COLUMNS = ("date", "description", "amount", "type", "account")


def _normalize(value) -> str:
    if value is None:
        return ""
    text = str(value).strip().lower()
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    return re.sub(r"\s+", "", text)


def _parse_date(value) -> Optional[date]:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    text = str(value).strip()
    for fmt in ("%d-%m-%Y", "%d/%m/%Y", "%Y-%m-%d", "%Y/%m/%d"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return None


def _parse_amount(value) -> Optional[float]:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip()
    if not text:
        return None
    negative = text.startswith("-")
    text = text.lstrip("+-").replace(" ", "")
    match = re.match(r"^(.*)[.,](\d{1,2})$", text)
    if match:
        integer_part = re.sub(r"[.,]", "", match.group(1)) or "0"
        decimals = match.group(2).ljust(2, "0")
    else:
        integer_part = re.sub(r"[.,]", "", text) or "0"
        decimals = "00"
    if not integer_part.lstrip("-").isdigit():
        return None
    result = float(f"{integer_part}.{decimals}")
    return -result if negative else result


def _parse_type(value) -> Optional[TransactionType]:
    return TYPE_LABELS.get(_normalize(value))


def parse_xlsx(file_bytes: bytes, accounts: List[Account], categories: List[Category]) -> List[ImportPreviewRow]:
    try:
        workbook = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True, read_only=True)
    except Exception as e:
        raise ValueError("Não foi possível abrir o ficheiro. Confirme que é um .xlsx válido.") from e

    sheet = workbook.active
    rows_iter = sheet.iter_rows(values_only=True)
    header_row = next(rows_iter, None)
    if not header_row:
        raise ValueError("A folha de cálculo está vazia.")

    col_index: Dict[str, int] = {}
    for idx, cell in enumerate(header_row):
        key = HEADER_MAP.get(_normalize(cell))
        if key and key not in col_index:
            col_index[key] = idx

    missing = [c for c in REQUIRED_COLUMNS if c not in col_index]
    if missing:
        raise ValueError(
            "Colunas em falta no ficheiro: " + ", ".join(missing)
            + ". Esperado: Data | Descrição | Valor | Tipo | Conta | Categoria"
        )

    accounts_by_name = {_normalize(a.name): a for a in accounts}
    categories_by_name = {_normalize(c.name): c for c in categories}

    def cell(row, key):
        idx = col_index.get(key)
        if idx is None or idx >= len(row):
            return None
        return row[idx]

    results: List[ImportPreviewRow] = []
    for row_number, row in enumerate(rows_iter, start=2):
        if row is None or all(v is None or str(v).strip() == "" for v in row):
            continue

        errors: List[str] = []

        parsed_date = _parse_date(cell(row, "date"))
        if parsed_date is None:
            errors.append("data inválida")

        description = cell(row, "description")
        description = str(description).strip() if description is not None else None

        amount = _parse_amount(cell(row, "amount"))
        if amount is None:
            errors.append("valor inválido")

        raw_type = cell(row, "type")
        parsed_type = _parse_type(raw_type)
        if parsed_type is None:
            errors.append("tipo inválido")

        raw_account = cell(row, "account")
        account = accounts_by_name.get(_normalize(raw_account))
        if account is None:
            errors.append("conta não encontrada")

        raw_destination = cell(row, "destination_account")
        destination_account = None
        if raw_destination:
            destination_account = accounts_by_name.get(_normalize(raw_destination))
            if destination_account is None:
                errors.append("conta destino não encontrada")

        if parsed_type == TransactionType.transfer:
            if destination_account is None:
                errors.append("transferência precisa de 'Conta Destino'")
            elif account is not None and destination_account.id == account.id:
                errors.append("conta destino tem de ser diferente da conta de origem")

        raw_category = cell(row, "category")
        category = None
        if raw_category:
            category = categories_by_name.get(_normalize(raw_category))
            if category is None:
                errors.append("categoria não encontrada")
            elif parsed_type is not None and parsed_type not in (category.types or []):
                errors.append("categoria não é válida para este tipo")
                category = None

        results.append(
            ImportPreviewRow(
                row_number=row_number,
                valid=not errors,
                error="; ".join(errors) if errors else None,
                date=parsed_date,
                description=description,
                amount=round(abs(amount), 2) if amount is not None else None,
                type=parsed_type,
                account_name=str(raw_account).strip() if raw_account is not None else None,
                account_id=account.id if account else None,
                destination_account_name=str(raw_destination).strip() if raw_destination else None,
                destination_account_id=destination_account.id if destination_account else None,
                category_name=str(raw_category).strip() if raw_category else None,
                category_id=category.id if category else None,
            )
        )

    workbook.close()

    if not results:
        raise ValueError("Não foram encontradas linhas de transações no ficheiro.")

    return results
