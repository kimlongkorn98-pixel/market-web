"""Insert demo products so the web and mobile apps have something to show.

Only runs when the products table is empty, so it is safe to run repeatedly.
Run (after `alembic upgrade head`):  python seed_products.py
"""
import models  # noqa: F401  (registers all models)
from config.db import SessionLocal
from models.product import Product

IMG = "https://images.unsplash.com/{}?w=600&auto=format&fit=crop"

DEMO_PRODUCTS = [
    dict(title="Artisanal Dark Chocolate Truffles Box", price=24.99, original_price=30.0, category="food", condition="new", location="Phnom Penh", rating=4.9, reviews_count=32, is_flash_deal=True, image_url=IMG.format("photo-1548883354-94bcfe321cfa"), description="Handcrafted dark chocolate truffles made with 72% single-origin cacao. Box contains 12 pieces."),
    dict(title="Organic Premium Matcha Green Tea Powder", price=18.5, category="food", condition="new", location="Siem Reap", rating=4.6, reviews_count=11, image_url=IMG.format("photo-1582793988951-9aed550c94d4"), description="Ceremonial grade matcha sourced directly from Uji, Japan. 100g tin."),
    dict(title='Apple MacBook Pro 14" M3 - Excellent Condition', price=1499, original_price=1999, category="electronics", condition="like-new", location="Phnom Penh", rating=4.8, reviews_count=23, is_flash_deal=True, image_url=IMG.format("photo-1517336714731-489689fd1ca8"), description="MacBook Pro 14-inch with M3 chip. Only 6 months old, original box and charger. Battery health 98%."),
    dict(title="Sony WH-1000XM5 Wireless Headphones", price=249, original_price=399, category="electronics", condition="like-new", location="Battambang", rating=4.9, reviews_count=45, is_flash_deal=True, image_url=IMG.format("photo-1505740420928-5e560c06d30e"), description="Industry-leading noise cancellation. Used for 3 months, includes case and cables."),
    dict(title="Nike Air Jordan 1 Retro High OG - Size 10", price=280, category="fashion", condition="new", location="Phnom Penh", rating=4.5, reviews_count=12, image_url=IMG.format("photo-1542291026-7eec264c27ff"), description="Deadstock Chicago colorway, size 10. Never worn, original box and receipt."),
    dict(title="DJI Mini 3 Pro Drone with RC Controller", price=650, original_price=959, category="electronics", condition="like-new", location="Siem Reap", rating=4.7, reviews_count=8, image_url=IMG.format("photo-1473968512647-3e447244af8f"), description="Flown only 5 times. 2 batteries, charging hub, ND filters and carrying case."),
    dict(title="Vintage Leather Sofa - Mid Century Modern", price=450, category="home", condition="good", location="Phnom Penh", rating=4.6, reviews_count=6, image_url=IMG.format("photo-1555041469-a586c61ea9bc"), description="Cognac brown leather sofa. Very sturdy, minor wear consistent with age."),
    dict(title="Trek FX3 Disc Hybrid Bike - 2023", price=599, original_price=849, category="sports", condition="like-new", location="Kampot", rating=4.8, reviews_count=15, image_url=IMG.format("photo-1558618666-fcd25c85cd64"), description="Size Medium, one season of use. Hydraulic disc brakes, carbon fork."),
    dict(title="Canon EOS R6 Mark II Camera Body", price=1800, original_price=2499, category="electronics", condition="like-new", location="Phnom Penh", rating=4.9, reviews_count=31, is_flash_deal=True, image_url=IMG.format("photo-1516035069371-29a1b244cc32"), description="Less than 5k shutter actuations. Full-frame, 40fps burst."),
    dict(title="iPad Pro 12.9\" M2 with Apple Pencil", price=899, original_price=1299, category="electronics", condition="like-new", location="Battambang", rating=4.7, reviews_count=19, image_url=IMG.format("photo-1544244015-0df4b3ffc6b0"), description="256GB WiFi with Apple Pencil 2nd gen and Magic Keyboard."),
    dict(title="PlayStation 5 Console + 3 Games", price=450, category="toys", condition="good", location="Phnom Penh", rating=4.8, reviews_count=27, is_flash_deal=True, image_url=IMG.format("photo-1606813907291-d86efa9b94db"), description="Disc version with Spider-Man 2, God of War Ragnarök and The Last of Us Part I."),
    dict(title="Levi's 501 Original Jeans Bundle (5 pairs)", price=120, category="fashion", condition="good", location="Siem Reap", rating=4.3, reviews_count=7, image_url=IMG.format("photo-1542574271-7f3b92e6c821"), description="Five pairs, all size 32x32, various washes. Good condition."),
]


def main_seed():
    db = SessionLocal()
    try:
        if db.query(Product).count() > 0:
            print("Products table already has data - nothing to do.")
            return
        for p in DEMO_PRODUCTS:
            original = p.get("original_price")
            if original and original > p["price"]:
                p["discount_percentage"] = round((1 - p["price"] / original) * 100)
            db.add(Product(**p))
        db.commit()
        print(f"Inserted {len(DEMO_PRODUCTS)} demo products.")
    finally:
        db.close()


if __name__ == "__main__":
    main_seed()
