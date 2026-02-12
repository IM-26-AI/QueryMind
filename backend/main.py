import os
from io import BytesIO
import pandas as pd
from datetime import timedelta

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional

# --- IMPORTS ---
import models   # Your DB Tables
import schemas  # Your Pydantic Models
import auth     # Your JWT Logic
import utils    # Your Password Hashing
from db import engine, get_db
import services

# --- AGENT IMPORTS ---
try:
    from app.agents.graph import build_graph
    from app.services.rag import VectorService
    from app.services.database import execute_query as agent_execute_query
    AGENT_AVAILABLE = True
except ImportError:
    print("⚠️  Warning: Agent services not available. Query endpoint disabled.")
    AGENT_AVAILABLE = False

# Setup DB
models.Base.metadata.create_all(bind=engine)

app = FastAPI(docs_url="/",root_path="/api", redoc_url=None)

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In prod, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Uploads
UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Setup Security
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- SCHEMA DEFINITIONS ---
class QueryRequest(BaseModel):
    question: str
    data_source_id: Optional[int] = None  # Optional: User can specify which schema to use

class QueryResponse(BaseModel):
    sql_query: str
    results: list
    summary: str
    status: str

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


# --- QUERY ENDPOINTS ---

@app.get("/data-sources")
async def list_data_sources(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Returns all schemas uploaded by the current user.
    """
    sources = db.query(models.DataSource).filter(
        models.DataSource.user_id == current_user.id
    ).all()
    
    return [
        {
            "id": source.id,
            "filename": source.filename,
            "created_at": source.created_at,
            "schema_preview": source.schema_context[:200] + "..."  # Preview first 200 chars
        }
        for source in sources
    ]


@app.post("/query", response_model=QueryResponse)
async def process_query(
    query_request: QueryRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Process a natural language question and return SQL + results.
    Uses the agent workflow: Planner → Generator → Validator → Executor → Narrator
    """
    if not AGENT_AVAILABLE:
        raise HTTPException(
            status_code=503, 
            detail="Agent services not available. Please ensure agent dependencies are installed."
        )
    
    try:
        # 1. Get the agent
        agent = build_graph()
        
        # 2. Build initial state
        initial_state = {
            "question": query_request.question,
            "retry_count": 0
        }
        
        # 3. Run the agent workflow
        result = agent.invoke(initial_state)
        
        # 4. Parse results
        sql_query = result.get("sql_query", "")
        query_result = result.get("query_result", "[]")
        final_answer = result.get("final_answer", "")
        
        # Parse query results
        try:
            import ast
            results = ast.literal_eval(query_result) if query_result != "[]" else []
        except:
            results = []
        
        return QueryResponse(
            sql_query=sql_query,
            results=results,
            summary=final_answer,
            status="success"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Query processing failed: {str(e)}"
        )


@app.post("/upload_data")
async def upload_data(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Upload data file. Supports .csv and .sql files.
    For now, we'll store metadata and return success.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Accept CSV and SQL files
    allowed_extensions = {'.csv', '.sql'}
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Only {allowed_extensions} files are allowed"
        )
    
    try:
        # Read file content
        content = await file.read()
        
        # For CSV: Store as schema (basic parsing)
        # For SQL: Parse schema statements
        if file_ext == '.sql':
            content_str = content.decode('utf-8')
            schema_content = services.parse_sql_file(content_str)
            if not schema_content:
                raise HTTPException(status_code=400, detail="No valid SQL statements found")
        else:
            # For CSV, we'll just store a basic reference
            schema_content = f"CSV Data Upload: {file.filename}"
        
        # Save to database
        new_source = models.DataSource(
            user_id=current_user.id,
            filename=file.filename,
            schema_context=schema_content
        )
        db.add(new_source)
        db.commit()
        db.refresh(new_source)
        
        return {
            "message": f"File {file.filename} uploaded successfully",
            "id": new_source.id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")