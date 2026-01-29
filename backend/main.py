import os
from io import BytesIO
import pandas as pd
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from passlib.context import CryptContext
import hashlib

# Import your local modules
import models
from db import engine, get_db  # Ensure your file is named database.py

# 1. Setup Database Tables
# This creates the 'users' table automatically if it doesn't exist
models.Base.metadata.create_all(bind=engine)

# 2. Setup Security (Password Hashing)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI()

# Create a temporary directory (optional, good for debugging uploads)
UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- Pydantic Models ---
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str

# --- Helper Functions ---
def get_password_hash(password):
    # 1. Pre-hash with SHA-256 to ensure it fits within 72 bytes
    # We encode to utf-8 first, then hash, then hex digest
    sha256_password = hashlib.sha256(password.encode('utf-8')).hexdigest()
    
    # 2. Now pass the safe, fixed-length string to bcrypt
    return pwd_context.hash(sha256_password)

# --- Endpoints ---

@app.get("/")
async def root():
    return {"message": "AI Business Analyst API is running"}

@app.post("/create_user")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Creates a new user with a securely hashed password.
    """
    # 1. Check if email already exists
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Hash the password (Real security)
    hashed_password = get_password_hash(user.password)
    return {"Passw":hashed_password}
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
    """
    Receives a CSV or SQL file and loads it into the database.
    """
    filename = file.filename
    
    # --- HANDLE CSV FILES ---
    if filename.endswith(".csv"):
        try:
            # Read file into memory
            contents = await file.read()
            df = pd.read_csv(BytesIO(contents))
            
            # Clean table name (remove extension, lower case)
            table_name = filename.split(".")[0].lower()
            
            # Insert into Postgres using the Engine
            # if_exists='replace' will DROP the table if it exists and create new
            df.to_sql(table_name, engine, if_exists='replace', index=False)
            
            return {
                "message": f"Successfully created table '{table_name}'", 
                "rows_inserted": len(df),
                "columns": list(df.columns)
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")

    # --- HANDLE SQL FILES ---
    elif filename.endswith(".sql"):
        try:
            contents = await file.read()
            sql_script = contents.decode("utf-8")
            
            # Execute raw SQL script
            with engine.connect() as connection:
                connection.execute(text(sql_script))
                connection.commit() # Important for data changes
            
            return {"message": "SQL script executed successfully."}
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error executing SQL: {str(e)}")

    else:
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload .csv or .sql")