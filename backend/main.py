import os
import hashlib
import bcrypt
from io import BytesIO
import pandas as pd
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel

# Import your local modules
import models
from db import engine, get_db
from utils import get_password_hash, verify_password

# 1. Setup Database Tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- Pydantic Models ---
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str


# --- Endpoints ---

@app.get("/")
async def root():
    return {"message": "AI Business Analyst API is running"}

@app.post("/create_user")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # 1. Check if email already exists
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Hash the password
    try:
        hashed_password = get_password_hash(user.password)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hashing error: {str(e)}")

    # 3. Create the database object
    db_user = models.User(
        email=user.email, 
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    
    # 4. Save to DB
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return {"message": "User created successfully", "user_id": db_user.id}

@app.post("/upload_data")
async def upload_data(file: UploadFile = File(...)):
    filename = file.filename
    
    if filename.endswith(".csv"):
        try:
            contents = await file.read()
            df = pd.read_csv(BytesIO(contents))
            table_name = filename.split(".")[0].lower()
            df.to_sql(table_name, engine, if_exists='replace', index=False)
            return {"message": f"Successfully created table '{table_name}'", "rows_inserted": len(df)}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")

    elif filename.endswith(".sql"):
        try:
            contents = await file.read()
            sql_script = contents.decode("utf-8")
            with engine.connect() as connection:
                connection.execute(text(sql_script))
                connection.commit()
            return {"message": "SQL script executed successfully."}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error executing SQL: {str(e)}")

    else:
        raise HTTPException(status_code=400, detail="Invalid file type.")