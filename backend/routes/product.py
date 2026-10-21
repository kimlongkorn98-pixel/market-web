from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from config.db import get_db
from config.deps import get_current_user, require_permission
from config.permissions import Perm
from models.product import Product
from models.user import User
from schemas.product import ProductCreate, ProductResponse, ProductUpdate

router = APIRouter(prefix="/api/products", tags=["Products"])

# API ទាញយកបញ្ជីទំនិញ
@router.get("/", response_model=List[ProductResponse])
def get_products(
    category: Optional[str] = None,
    flash_deals: Optional[bool] = None,
    seller_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Product)
    if flash_deals is not None:
        query = query.filter(Product.is_flash_deal == flash_deals)
    if category and category.lower() != "all":
        query = query.filter(Product.category.ilike(category))
    if seller_id is not None:
        query = query.filter(Product.seller_id == seller_id)
    return query.order_by(Product.id.desc()).all()

# API ទាញយកទំនិញមួយ
@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product

def _discount(price: float, original: Optional[float]) -> int:
    if original and original > price:
        return round((1 - price / original) * 100)
    return 0

def _get_owned_or_403(db: Session, product_id: int, user: User, any_perm: str) -> Product:
    """The product, if `user` owns it or has the `*_any` moderation permission."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    if product.seller_id != user.id and not user.has_permission(any_perm):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only change your own listings.")
    return product

# Only moderators may feature a listing or set its rating.
_MODERATOR_FIELDS = ("is_flash_deal", "rating", "reviews_count")

def _strip_moderator_fields(data: dict, user: User) -> dict:
    if not user.has_permission(Perm.PRODUCTS_UPDATE_ANY):
        for key in _MODERATOR_FIELDS:
            data.pop(key, None)
    return data

# API បញ្ចូលទំនិញថ្មី (ត្រូវ login)
@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Perm.PRODUCTS_CREATE)),
):
    data = _strip_moderator_fields(product.model_dump(), current_user)
    if data.get("category"):
        data["category"] = data["category"].lower()
    # Derive the discount badge from the two prices when the client didn't send one.
    if not data.get("discount_percentage"):
        data["discount_percentage"] = _discount(data["price"], data.get("original_price"))
    db_product = Product(**data, seller_id=current_user.id)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

# API កែប្រែទំនិញ (ម្ចាស់ ឬ admin)
@router.patch("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    changes: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = _get_owned_or_403(db, product_id, current_user, Perm.PRODUCTS_UPDATE_ANY)
    data = _strip_moderator_fields(changes.model_dump(exclude_unset=True), current_user)
    if data.get("category"):
        data["category"] = data["category"].lower()
    for key, value in data.items():
        setattr(product, key, value)
    if "price" in data or "original_price" in data:
        product.discount_percentage = _discount(product.price, product.original_price)
    db.commit()
    db.refresh(product)
    return product

# API លុបទំនិញ (ម្ចាស់ ឬ admin)
@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = _get_owned_or_403(db, product_id, current_user, Perm.PRODUCTS_DELETE_ANY)
    db.delete(product)
    db.commit()
