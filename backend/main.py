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
from db import engine, get_db, SessionLocal
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


@app.on_event("startup")
def ensure_test_user():
    """
    Ensure a permanent test user exists so developers can log in after container restarts.
    """
    import os
    try:
        # Read credentials from environment to avoid hardcoding secrets in repo
        test_username = os.getenv('DEV_TEST_USERNAME')
        test_password = os.getenv('DEV_TEST_PASSWORD')
        test_fullname = os.getenv('DEV_TEST_FULLNAME', 'Dev Test User')
        test_email = os.getenv('DEV_TEST_EMAIL', test_username)

        # If no username/password provided, do nothing (safer for public repos)
        if not test_username or not test_password:
            print('DEV_TEST_USERNAME or DEV_TEST_PASSWORD not set; skipping test user creation')
            return

        db = SessionLocal()
        # Check if the test user exists
        existing = db.query(models.User).filter(models.User.email == test_email).first()
        if existing:
            db.close()
            return

        # Create the test user with a hashed password using utils
        hashed = utils.get_password_hash(test_password)

        test_user = models.User(
            email=test_email,
            hashed_password=hashed,
            full_name=test_fullname,
            is_active=True
        )
        db.add(test_user)
        db.commit()
        db.close()
        print(f'Created permanent test user: {test_email}')
    except Exception as e:
        try:
            db.close()
        except Exception:
            pass
        print(f"Failed to ensure test user: {e}")


@app.on_event("startup")
def ensure_demo_db_seeded():
    """
    Ensure the AGENT database exists and is seeded with sample data if a seed file is available.
    This is idempotent and safe to run on startup in development environments.
    """
    import os
    from urllib.parse import urlparse
    try:
        agent_db_url = os.getenv('AGENT_DATABASE_URL')
        if not agent_db_url:
            print('AGENT_DATABASE_URL not set; skipping demo DB seeding')
            return

        # Parse the target database name
        parsed = urlparse(agent_db_url)
        target_db = parsed.path.lstrip('/')
        if not target_db:
            print('Could not determine target DB name from AGENT_DATABASE_URL')
            return

        # Connect to the main configured DB (used for admin operations)
        from app.services.database import get_db_connection
        admin_url = os.getenv('DATABASE_URL')
        admin_conn = get_db_connection(admin_url)
        if not admin_conn:
            print('Failed to connect to admin DATABASE_URL; skipping demo DB creation')
            return

        cur = admin_conn.cursor()
        cur.execute("SELECT 1 FROM pg_database WHERE datname=%s", (target_db,))
        exists = cur.fetchone()
        if not exists:
            try:
                # Close the previous cursor and set autocommit/isolation before CREATE DATABASE
                cur.close()
                try:
                    import psycopg2
                    from psycopg2 import extensions
                    admin_conn.set_isolation_level(extensions.ISOLATION_LEVEL_AUTOCOMMIT)
                except Exception:
                    try:
                        admin_conn.autocommit = True
                    except Exception:
                        pass

                cur = admin_conn.cursor()
                cur.execute(f"CREATE DATABASE {target_db};")
                print(f'Created database {target_db}')
            except Exception as e:
                print(f'Failed to create database {target_db}: {e}')
            finally:
                try:
                    cur.close()
                except Exception:
                    pass
                try:
                    admin_conn.set_isolation_level(extensions.ISOLATION_LEVEL_READ_COMMITTED)
                except Exception:
                    try:
                        admin_conn.autocommit = False
                    except Exception:
                        pass
        else:
            cur.close()
        admin_conn.close()

        # Now seed the target DB if a seed file exists
        seed_path = os.path.join(os.getcwd(), 'database', 'docker-init', '02_sample_complex_seed.sql')
        if not os.path.exists(seed_path):
            print(f'Seed file not found at {seed_path}; skipping seeding')
            return

        # Read SQL and execute statements sequentially
        with open(seed_path, 'r', encoding='utf-8') as f:
            sql = f.read()

        # Split on semicolons to run statements one by one (simple but adequate for our seed)
        statements = [s.strip() for s in sql.split(';') if s.strip()]

        target_conn = get_db_connection(agent_db_url)
        if not target_conn:
            print(f'Failed to connect to target DB {agent_db_url}; skipping seeding')
            return

        tcur = target_conn.cursor()
        for stmt in statements:
            try:
                tcur.execute(stmt)
            except Exception as e:
                # Log and continue
                print(f'Error executing statement during seeding: {e}')
        target_conn.commit()
        tcur.close()
        target_conn.close()
        print(f'Seeded demo DB: {target_db} (statements executed: {len(statements)})')

    except Exception as e:
        print(f'Unexpected error during demo DB seeding: {e}')

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

    # If agent services (RAG) are available, index each table DDL into the vector DB
    if AGENT_AVAILABLE:
        try:
            # services.parse_sql_blocks returns list of DDL blocks
            ddl_blocks = services.parse_sql_blocks(content_str)
            if ddl_blocks:
                rag = VectorService()
                import re
                for ddl in ddl_blocks:
                    m = re.search(r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`\"]?([A-Za-z0-9_]+)[`\"]?', ddl, flags=re.IGNORECASE)
                    table_name = m.group(1) if m else f"table_{hash(ddl) % 100000}"
                    try:
                        rag.add_table_context(table_name=table_name, ddl=ddl, description=f"Uploaded by {current_user.email}")
                    except Exception:
                        # Non-fatal: continue indexing other tables
                        pass
        except Exception:
            pass

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

        # If agent services available, index SQL DDL blocks into Chroma for RAG
        if file_ext == '.sql' and AGENT_AVAILABLE:
            try:
                ddl_blocks = services.parse_sql_blocks(content_str)
                if ddl_blocks:
                    rag = VectorService()
                    import re
                    for ddl in ddl_blocks:
                        m = re.search(r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`\"]?([A-Za-z0-9_]+)[`\"]?', ddl, flags=re.IGNORECASE)
                        table_name = m.group(1) if m else f"table_{hash(ddl) % 100000}"
                        try:
                            rag.add_table_context(table_name=table_name, ddl=ddl, description=f"Uploaded by {current_user.email}")
                        except Exception:
                            pass
            except Exception:
                pass
        
        return {
            "message": f"File {file.filename} uploaded successfully",
            "id": new_source.id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")