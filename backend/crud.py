from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
import models, schemas


# ── Dashboard ─────────────────────────────────────────────────────────────────
def get_dashboard(db: Session):
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()
    low_stock = db.query(models.Product).filter(models.Product.quantity <= 5).all()
    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products": [
            {"id": p.id, "name": p.name, "sku": p.sku, "quantity": p.quantity}
            for p in low_stock
        ],
    }


# ── Products ──────────────────────────────────────────────────────────────────
def create_product(db: Session, data: schemas.ProductCreate):
    existing = db.query(models.Product).filter(models.Product.sku == data.sku).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"SKU '{data.sku}' already exists")
    product = models.Product(**data.dict())
    db.add(product)
    try:
        db.commit()
        db.refresh(product)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="SKU already exists")
    return product


def get_products(db: Session):
    return db.query(models.Product).order_by(models.Product.id.desc()).all()


def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()


def update_product(db: Session, product_id: int, data: schemas.ProductUpdate):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        return None
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if "sku" in update_data:
        conflict = db.query(models.Product).filter(
            models.Product.sku == update_data["sku"],
            models.Product.id != product_id
        ).first()
        if conflict:
            raise HTTPException(status_code=409, detail=f"SKU '{update_data['sku']}' already exists")
    for key, value in update_data.items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        return False
    db.delete(product)
    db.commit()
    return True


# ── Customers ─────────────────────────────────────────────────────────────────
def create_customer(db: Session, data: schemas.CustomerCreate):
    existing = db.query(models.Customer).filter(models.Customer.email == data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Email '{data.email}' already registered")
    customer = models.Customer(**data.dict())
    db.add(customer)
    try:
        db.commit()
        db.refresh(customer)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email already registered")
    return customer


def get_customers(db: Session):
    return db.query(models.Customer).order_by(models.Customer.id.desc()).all()


def get_customer(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()


def delete_customer(db: Session, customer_id: int):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        return False
    db.delete(customer)
    db.commit()
    return True


# ── Orders ────────────────────────────────────────────────────────────────────
def create_order(db: Session, data: schemas.OrderCreate):
    customer = db.query(models.Customer).filter(models.Customer.id == data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if not data.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    # Validate stock for all items first
    total = 0.0
    resolved_items = []
    for item in data.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=422,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.quantity}, Requested: {item.quantity}"
            )
        resolved_items.append((product, item.quantity))
        total += product.price * item.quantity

    # Create order
    order = models.Order(customer_id=data.customer_id, total_amount=total)
    db.add(order)
    db.flush()

    # Deduct stock and create order items
    for product, qty in resolved_items:
        product.quantity -= qty
        order_item = models.OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=qty,
            unit_price=product.price,
        )
        db.add(order_item)

    db.commit()
    db.refresh(order)
    return order


def get_orders(db: Session):
    return db.query(models.Order).order_by(models.Order.id.desc()).all()


def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()


def delete_order(db: Session, order_id: int):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        return False
    # Restore stock
    for item in order.items:
        item.product.quantity += item.quantity
    db.delete(order)
    db.commit()
    return True
