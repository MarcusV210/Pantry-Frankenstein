from app.database import Base 
from sqlalchemy import String , Float, Integer
from sqlalchemy.orm import mapped_column, Mapped 

class IngredientModel(Base):
    __tablename__ = 'ingredients'

    id : Mapped[int] = mapped_column(primary_key = True)
    name : Mapped[str] = mapped_column(String(255), unique = True, nullable = False, index = True)
    category : Mapped[str] = mapped_column(String(255), nullable = False, )
    density_g_per_ml : Mapped[float | None] = mapped_column(Float, nullable = True)
    standard_unit : Mapped[str] = mapped_column(String(255), nullable = False)