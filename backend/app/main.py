from fastapi import FastAPI
from app.api.auth import router as auth_router
from app.database import SessionLocal
from sqlalchemy import text
import os 

app = FastAPI(title="Backend something")
app.include_router(auth_router, prefix="/auth")



@app.get("/health")
def get_health():
    return {"message":"I am alive."}

@app.get("/db-test")
def get_db_test():
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        return {"message":"connected"}
    except Exception as e:
        return {"message":"failed", "error":str(e)}

@app.get("/env-test")
def get_env_test():
    return {
        "loaded_env_variables": bool(os.getenv("DATABASE_URL"))
    }