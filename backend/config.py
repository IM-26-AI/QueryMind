from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # These fields are REQUIRED. 
    # If they are missing from .env, the app will NOT start.
    DATABASE_URL: str
    SECRET_KEY: str
    DB_USER: str
    DB_PASSWORD: str
    
    # These have defaults, so they are OPTIONAL
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"  # It can also read from a local .env file

# Create a global settings object
settings = Settings()