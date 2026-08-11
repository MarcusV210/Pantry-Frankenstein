from pint import UnitRegistry

ureg = UnitRegistry()

def normalise(quantity: float, unit: str, density: float) -> float:
    volume = quantity * ureg(unit)
    volume = volume.to("milliliter").magnitude
    mass = volume * density

    return mass


print(
    normalise(
        2,
        "cups",
        0.593,
    )
)