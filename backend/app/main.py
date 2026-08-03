# pyrefly: ignore [missing-import]
from fastapi import FastAPI

app = FastAPI(title="Backend something")

@app.get("/health")
def get_health():
    return {"message":"I am alive."}