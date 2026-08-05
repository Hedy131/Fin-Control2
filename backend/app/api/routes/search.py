from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.models.account import Account
from app.models.category import Category
from app.models.enums import TransactionType
from app.schemas.search import SearchResults, TransactionResult, AccountResult, CategoryResult

router = APIRouter(prefix="/search", tags=["search"])

RESULT_LIMIT = 6


@router.get("/", response_model=SearchResults)
def search(q: str = "", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = q.strip()
    if not query:
        return SearchResults()

    like = f"%{query}%"

    transaction_rows = (
        db.query(Transaction, Account.currency)
        .join(Account, Transaction.account_id == Account.id)
        .filter(Transaction.user_id == current_user.id, Transaction.description.ilike(like))
        .order_by(Transaction.date.desc())
        .limit(RESULT_LIMIT)
        .all()
    )
    transactions = [
        TransactionResult(
            id=t.id,
            description=t.description,
            date=t.date,
            amount=t.amount,
            currency=currency.value if hasattr(currency, "value") else currency,
            category_id=t.category_id,
        )
        for t, currency in transaction_rows
    ]

    account_rows = (
        db.query(Account)
        .filter(Account.user_id == current_user.id, Account.name.ilike(like))
        .limit(RESULT_LIMIT)
        .all()
    )
    accounts = [
        AccountResult(id=a.id, name=a.name, currency=a.currency.value if hasattr(a.currency, "value") else a.currency)
        for a in account_rows
    ]

    matched_categories = (
        db.query(Category)
        .filter(Category.user_id == current_user.id, Category.name.ilike(like))
        .limit(RESULT_LIMIT * 3)
        .all()
    )

    def category_results(transaction_type: TransactionType):
        return [
            CategoryResult(category_id=c.id, name=c.name, color=c.color)
            for c in matched_categories
            if transaction_type in (c.types or [])
        ][:RESULT_LIMIT]

    return SearchResults(
        transactions=transactions,
        accounts=accounts,
        budgets=category_results(TransactionType.expense),
        investments=category_results(TransactionType.investment),
        goals=category_results(TransactionType.savings),
    )
