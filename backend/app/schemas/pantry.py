from pint.facets.numpy import quantity
from pydantic import BaseModel
from datetime import date

class PantryItemCreate(BaseModel):
    name: str 
    quantity_raw: float 
    unit_raw: str 
    expiry: date

class PantryItemOut(BaseModel):
    id: int 
    name: str
    quantity_raw: float 
    unit_raw: str 
    quantity_normalised: float 
    expiration_date: date
    days_until_expiry: int 

    class ConfigDict:
        from_attributes = True

class PantryItemUpdate(BaseModel):
    quantity_raw: float 
    unit_raw: str