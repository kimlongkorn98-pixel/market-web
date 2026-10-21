from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from config.db import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(String(500), nullable=True)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    discount_percentage = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    reviews_count = Column(Integer, default=0)
    image_url = Column(String(500), nullable=True)
    category = Column(String(50), default="All")
    is_flash_deal = Column(Boolean, default=False)
    # Marketplace listing details. Nullable so products created by older
    # clients (or before these columns existed) stay valid.
    condition = Column(String(20), nullable=True)
    location = Column(String(100), nullable=True)
    seller_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())

    seller = relationship("User", lazy="joined")

    @property
    def seller_name(self):
        return self.seller.name if self.seller else None
