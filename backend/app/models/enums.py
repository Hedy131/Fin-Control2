import enum

from sqlalchemy import Enum as SAEnum


class TransactionType(str, enum.Enum):
    income = "income"
    expense = "expense"
    investment = "investment"
    transfer = "transfer"


# Single shared column type so Transaction.type and Category.types
# reference the same Postgres enum instead of trying to CREATE TYPE twice.
transaction_type_enum = SAEnum(TransactionType, name="transaction_type")
