from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.import_xlsx import (
    ImportPreviewResponse,
    ImportConfirmRequest,
    ImportConfirmResponse,
)
from app.schemas.transaction import TransactionCreate
from app.crud import account as crud_account
from app.crud import category as crud_category
from app.crud import transaction as crud_transaction
from app.services.xlsx_import import parse_xlsx

router = APIRouter(prefix="/imports", tags=["imports"])

MAX_XLSX_BYTES = 10 * 1024 * 1024
XLSX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


@router.post("/preview", response_model=ImportPreviewResponse)
async def preview_import(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    is_xlsx = (file.content_type == XLSX_CONTENT_TYPE) or (file.filename or "").lower().endswith(".xlsx")
    if not is_xlsx:
        raise HTTPException(status_code=400, detail="O ficheiro tem de ser uma folha de cálculo .xlsx")

    content = await file.read()
    if len(content) > MAX_XLSX_BYTES:
        raise HTTPException(status_code=400, detail="O ficheiro excede o limite de 10MB")

    accounts = crud_account.get_accounts(db, current_user.id)
    categories = crud_category.get_categories(db, current_user.id)

    try:
        rows = parse_xlsx(content, accounts, categories)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return ImportPreviewResponse(rows=rows)


@router.post("/confirm", response_model=ImportConfirmResponse)
def confirm_import(
    payload: ImportConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    accounts = {a.id: a for a in crud_account.get_accounts(db, current_user.id)}
    categories = {c.id: c for c in crud_category.get_categories(db, current_user.id)}

    created = 0
    for row in payload.transactions:
        if row.account_id not in accounts:
            continue
        destination_account_id = row.destination_account_id
        if destination_account_id is not None and destination_account_id not in accounts:
            destination_account_id = None

        category_id = row.category_id
        if category_id is not None:
            category = categories.get(category_id)
            if category is None or row.type not in (category.types or []):
                category_id = None

        transaction_in = TransactionCreate(
            account_id=row.account_id,
            destination_account_id=destination_account_id,
            category_id=category_id,
            type=row.type,
            amount=row.amount,
            description=row.description,
            date=row.date,
        )
        try:
            crud_transaction.create_transaction(db, current_user.id, transaction_in)
        except ValueError:
            continue
        created += 1

    return ImportConfirmResponse(created=created)
