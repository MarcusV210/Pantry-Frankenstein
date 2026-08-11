from sqlalchemy.sql.functions import dense_rank
from pint import UnitRegistry

ureg = UnitRegistry()

def normalise(quantity: float, unit: str, density: float) -> float:
    if not density:
        return quantity

    volume = quantity * ureg(unit)
    volume = volume.to("milliliter").magnitude
    mass = volume * density

    return mass
