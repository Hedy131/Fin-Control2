from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryOut
from app.crud import category as crud_category

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=List[CategoryOut])
def list_categories(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud_category.get_categories(db, current_user.id)


@router.post("/", response_model=CategoryOut, status_code=201)
def create_category(
    category_in: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return crud_category.create_category(db, current_user.id, category_in)


@router.put("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    category = crud_category.get_category(db, current_user.id, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    try:
        return crud_category.update_category(db, category, category_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    category = crud_category.get_category(db, current_user.id, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    crud_category.delete_category(db, category)
