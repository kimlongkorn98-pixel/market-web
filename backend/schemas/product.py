from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

class ProductBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=500)
    price: float = Field(gt=0)
    original_price: Optional[float] = None
    discount_percentage: Optional[int] = 0
    rating: Optional[float] = 0.0
    reviews_count: Optional[int] = 0
    image_url: Optional[str] = None
    category: Optional[str] = "All"
    is_flash_deal: Optional[bool] = False
    condition: Optional[str] = None
    location: Optional[str] = None

class ProductCreate(ProductBase):
    pass

# Partial update: only the fields sent are changed.
class ProductUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=500)
    price: Optional[float] = Field(default=None, gt=0)
    original_price: Optional[float] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    is_flash_deal: Optional[bool] = None
    condition: Optional[str] = None
    location: Optional[str] = None

class ProductResponse(ProductBase):
    id: int
    seller_id: Optional[int] = None
    seller_name: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
