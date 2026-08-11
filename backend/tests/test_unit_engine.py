import pytest
from app.core.unit_engine import normalise

def test_cups_to_grams():
    result = normalise(
        quantity=2,
        unit="cups",
        density=0.593,
    )

    expected = 473.176 * 0.593

    assert result == pytest.approx(expected, rel=1e-3)


def test_tablespoons_to_grams():
    result = normalise(
        quantity=2,
        unit="tablespoons",
        density=1.0,
    )

    expected = 2 * 14.7868

    assert result == pytest.approx(expected, rel=1e-3)


def test_milliliters_to_grams():
    result = normalise(
        quantity=100,
        unit="milliliters",
        density=1.0,
    )

    assert result == pytest.approx(100.0)


def test_different_density():
    result = normalise(
        quantity=100,
        unit="milliliters",
        density=0.593,
    )

    assert result == pytest.approx(59.3)

def test_no_density():
    result = normalise(
        quantity=3,
        unit=None, 
        density=0.2
    )

    assert result == pytest.approx(3)