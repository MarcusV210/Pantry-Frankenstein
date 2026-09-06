from sqlalchemy.sql.functions import dense_rank
from pint import UnitRegistry

ureg = UnitRegistry()

MASS_UNITS = {"g", "kg", "oz", "lb"}

def normalise(quantity: float, unit: str, density: float) -> float:
    if not density or not unit or unit == "piece":
        return quantity
    
    if unit in MASS_UNITS:
        mass = (quantity * ureg(unit)).to("gram").magnitude
        return mass

    volume = (quantity * ureg(unit)).to("milliliter").magnitude
    mass = volume * density

    return mass
