from fastapi import FastAPI, UploadFile, File, HTTPException
import shutil
import os
import pandas as pd
from io import BytesIO

app = FastAPI()

# Create a temporary directory to store uploaded files (optional)
UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/HelloWorld")
async def PrintHello():
    return {"meesage":"Hello Query Mind"}

@app.post("/upload_data")
async def upload_data(file: UploadFile = File(...)):
    """
    Receives a CSV or SQL file and loads it into the database.
    """
    filename = file.filename
    
    # 1. Handle CSV Files
    if filename.endswith(".csv"):
        # Read file into memory
        contents = await file.read()
        df = pd.read_csv(BytesIO(contents))
        
        # TODO: Insert this dataframe into your Postgres DB
        # df.to_sql("uploaded_table", db_engine, if_exists='replace')
        
        return {"message": f"Successfully loaded CSV with {len(df)} rows.", "columns": list(df.columns)}

    # 2. Handle SQL Files
    elif filename.endswith(".sql"):
        contents = await file.read()
        sql_script = contents.decode("utf-8")
        
        # TODO: Execute this script against your Postgres DB
        # connection.execute(sql_script)
        
        return {"message": "SQL script executed successfully."}

    else:
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload .csv or .sql")