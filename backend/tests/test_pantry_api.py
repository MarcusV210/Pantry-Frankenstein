import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_auth_token():
    response = client.post("/auth/login", data={
        "username": "anamay@gmail.com",
        "password": "anamay123"
    })
    print(response.json())
    return response.json()["access_token"]

def auth_headers():
    return {"Authorization": f"Bearer {get_auth_token()}"}

def test_add_pantry_item():
    response = client.post("/pantry/items", json={
        "name": "rice",
        "quantity_raw": 2,
        "unit_raw": "cups",
        "expiry": "2026-12-01"
    }, headers=auth_headers())
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "rice"
    assert data["quantity_normalised"] > 0
    assert "days_until_expiry" in data

def test_get_pantry():
    response = client.get("/pantry/", headers=auth_headers())
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_expiring():
    response = client.get("/pantry/expiring?days=30", headers=auth_headers())
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_update_pantry_item():
    # first add an item
    add = client.post("/pantry/items", json={
        "name": "rice",
        "quantity_raw": 1,
        "unit_raw": "cup",
        "expiry": "2026-12-01"
    }, headers=auth_headers())
    item_id = add.json()["id"]

    # then update it
    response = client.patch(f"/pantry/items/{item_id}", json={
        "quantity_raw": 3,
        "unit_raw": "cups"
    }, headers=auth_headers())
    assert response.status_code == 200
    assert response.json()["quantity_raw"] == 3

def test_delete_pantry_item():
    # first add an item
    add = client.post("/pantry/items", json={
        "name": "rice",
        "quantity_raw": 1,
        "unit_raw": "cup",
        "expiry": "2026-12-01"
    }, headers=auth_headers())
    item_id = add.json()["id"]

    # delete it
    response = client.delete(f"/pantry/items/{item_id}", headers=auth_headers())
    assert response.status_code == 200

    # confirm it's gone
    get = client.get("/pantry/", headers=auth_headers())
    ids = [item["id"] for item in get.json()]
    assert item_id not in ids

def test_add_invalid_ingredient():
    response = client.post("/pantry/items", json={
        "name": "unicorn meat",
        "quantity_raw": 1,
        "unit_raw": "cup",
        "expiry": "2026-12-01"
    }, headers=auth_headers())
    assert response.status_code == 404