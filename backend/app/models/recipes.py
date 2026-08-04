from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class RecipeModel(Base):
    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    ingredient_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    recipe_name: Mapped[str] = mapped_column(String(255), nullable=False)
    pantry_items_used: Mapped[dict] = mapped_column(JSONB, nullable=False)
    missing_items: Mapped[dict] = mapped_column(JSONB, nullable=False)
    instructions: Mapped[list] = mapped_column(JSONB, nullable=False)
    chaos_level: Mapped[int] = mapped_column(Integer, nullable=False)