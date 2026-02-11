import os
from io import BytesIO
import pandas as pd
from datetime import timedelta

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import text

# --- IMPORTS ---
import models   # Your DB Tables
import schemas  # Your Pydantic Models
import auth     # Your JWT Logic
import utils    # Your Password Hashing
from db import engine, get_db
import services

# Setup DB
models.Base.metadata.create_all(bind=engine)

app = FastAPI(docs_url="/",root_path="/api", redoc_url=None)

# Setup Uploads
UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Setup Security
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- ENDPOINTS ---

@app.get("/")
async def root():
    return {"message": "AI Business Analyst API is running"}

# Note: We now use schemas.Token
@app.post("/token", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    # Logic remains the same, just cleaner file!
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email")
    
    if not utils.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# Note: We use schemas.UserResponse and schemas.UserCreate
@app.post("/create_user", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = utils.get_password_hash(user.password)

    db_user = models.User(
        email=user.email, 
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@app.get("/users/me", response_model=schemas.UserResponse)
async def read_users_me(
    current_user: models.User = Depends(auth.get_current_user)
):
    return current_user

@app.put("/update_user", response_model=schemas.UserResponse)
async def update_user(
   user_update: schemas.UserUpdate, # Renamed to avoid confusion
   db: Session = Depends(get_db),
   current_user: models.User = Depends(auth.get_current_user)
):
    if user_update.password is not None:
        current_user.hashed_password = utils.get_password_hash(user_update.password)
    
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
        
    db.commit()
    db.refresh(current_user)

    return current_user


@app.post("/upload-schema")
async def upload_schema(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # 1. Validate file type
    if not file.filename.endswith('.sql'):
        raise HTTPException(status_code=400, detail="Only .sql files are allowed")

    # 2. Read file content
    content = await file.read()
    content_str = content.decode('utf-8')

    # 3. Parse using your service
    clean_schema = services.parse_sql_file(content_str)
    
    if not clean_schema:
        raise HTTPException(status_code=400, detail="No CREATE TABLE statements found.")

    # 4. Save to Database
    new_source = models.DataSource(
        user_id=current_user.id,  # <--- This works now!
        filename=file.filename,
        schema_context=clean_schema
    )
    db.add(new_source)
    db.commit()
    db.refresh(new_source)

    return {"msg": "Schema uploaded successfully", "id": new_source.id}