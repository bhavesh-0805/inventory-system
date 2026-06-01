from pydantic import BaseModel, EmailStr, validator
from typing import List, Optional
from datetime import datetime


# ── Product ──────────────────────────────────────────────────────────────────
class ProductBase(BaseModel):
    name: str
    sku: str
    price: float
    quantity: int

    @validator("price")
    def price_positive(cls, v):
        if v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @validator("quantity")
    def quantity_non_negative(cls, v):
        if v < 0:
            raise ValueError("Quantity cannot be negative")
        return v


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None

    @validator("price", pre=True, always=True)
    def price_positive(cls, v):
        if v is not None and v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @validator("quantity", pre=True, always=True)
    def quantity_non_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError("Quantity cannot be negative")
        return v


class Product(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── Customer ──────────────────────────────────────────────────────────────────
class CustomerBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str


class CustomerCreate(CustomerBase):
    pass


class Customer(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── Order ─────────────────────────────────────────────────────────────────────
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

    @validator("quantity")
    def quantity_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be positive")
        return v


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    product: Product

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]


class Order(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    status: str
    created_at: datetime
    customer: Customer
    items: List[OrderItemOut]

    class Config:
        from_attributes = True
