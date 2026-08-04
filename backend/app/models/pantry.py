from datetime import date
from sqlalchemy import String, Float, ForeignKey, Date
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base 

class Pantry(Base):
    __tablename__ = 'pantry'

    id : Mapped[int] = mapped_column(primary_key = True)
    user_id : Mapped[int] = mapped_column(ForeignKey("users.id"), nullable = False, index = True)
    ingredient_id : Mapped[int] = mapped_column(ForeignKey("ingredients.id"), nullable = False, index = True)
    quantity_raw : Mapped[float] = mapped_column(Float, nullable = False)
    unit_raw : Mapped[str] = mapped_column(String(255), nullable = False)
    quantity_normalised : Mapped[float] = mapped_column(Float, nullable = False)
    expiration_date : Mapped[date | None] = mapped_column(Date, nullable = True) # Expiry can be null if not found potentially.