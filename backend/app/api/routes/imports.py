from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.import_pdf import (
    ImportPreviewResponse,
    ImportPreviewRow,
    ImportConfirmRequest,
    ImportConfirmResponse,
)
from app.schemas.transaction import TransactionCreate
from app.crud import account as crud_account
from app.crud import category as crud_category
from app.crud import transaction as crud_transaction
from app.services.pdf_import import extract_transactions_from_pdf

router = APIRouter(prefix="/imports", tags=["imports"])

MAX_PDF_BYTES = 15 * 1024 * 1024


def _match_category(name, categories, type):
    if not name:
        return None
    target = name.strip().lower()
    for c in categories:
        if c.name.strip().lower() == target and type in (c.types or []):
            return c.id
    return None


@router.post("/preview", response_model=ImportPreviewResponse)
async def preview_import(
    account_id: int = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    account = crud_account.get_account(db, current_user.id, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    is_pdf = (file.content_type == "application/pdf") or (file.filename or "").lower().endswith(".pdf")
    if not is_pdf:
        raise HTTPException(status_code=400, detail="O ficheiro tem de ser um PDF")

    content = await file.read()
    if len(content) > MAX_PDF_BYTES:
        raise HTTPException(status_code=400, detail="O PDF excede o limite de 15MB")

    categories = crud_category.get_categories(db, current_user.id)
    category_names = sorted({c.name for c in categories})

    try:
        extracted = extract_transactions_from_pdf(content, category_names)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    rows = []
    for row in extracted:
        category_id = _match_category(row.suggested_category, categories, row.type)
        rows.append(
            ImportPreviewRow(
                date=row.date,
                description=row.description,
                amount=row.amount,
                type=row.type,
                suggested_category_id=category_id,
                suggested_category_name=row.suggested_category if category_id else None,
            )
        )
    return ImportPreviewResponse(rows=rows)


@router.post("/confirm", response_model=ImportConfirmResponse)
def confirm_import(
    payload: ImportConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    account = crud_account.get_account(db, current_user.id, payload.account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    categories = {c.id: c for c in crud_category.get_categories(db, current_user.id)}

    created = 0
    for row in payload.transactions:
        category_id = row.category_id
        if category_id is not None:
            category = categories.get(category_id)
            if category is None or row.type not in (category.types or []):
                category_id = None

        transaction_in = TransactionCreate(
            account_id=payload.account_id,
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
