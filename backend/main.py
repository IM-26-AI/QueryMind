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

# Setup DB
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

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
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
):
    email = auth.get_current_user(token)
    if email is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
        
    return user

@app.post("/upload_data")
async def upload_data(
    file: UploadFile = File(...), 
    token: str = Depends(oauth2_scheme)
):
    auth.get_current_user(token) # Just verify token is valid
    
    filename = file.filename
    if filename.endswith(".csv"):
        contents = await file.read()
        df = pd.read_csv(BytesIO(contents))
        table_name = filename.split(".")[0].lower()
        df.to_sql(table_name, engine, if_exists='replace', index=False)
        return {"message": f"Table '{table_name}' created", "rows": len(df)}
        
    elif filename.endswith(".sql"):
        contents = await file.read()
        with engine.connect() as connection:
            connection.execute(text(contents.decode("utf-8")))
            connection.commit()
        return {"message": "SQL script executed"}
        
    else:
        raise HTTPException(status_code=400, detail="Invalid file type")