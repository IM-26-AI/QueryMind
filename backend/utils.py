import hashlib
import bcrypt

def get_password_hash(password: str) -> str:
    """
    1. Hash input with SHA-256 to get a fixed 64-char string (bypasses 72-byte limit).
    2. Hash that result with Bcrypt.
    """
    # Step 1: SHA-256 (Fixes length)
    sha256_password = hashlib.sha256(password.encode('utf-8')).hexdigest()
    
    # Step 2: Bcrypt (Real security)
    # bcrypt.hashpw returns bytes, so we decode to utf-8 to save as string in DB
    hashed_bytes = bcrypt.hashpw(sha256_password.encode('utf-8'), bcrypt.gensalt())
    return hashed_bytes.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a password against the hash in the DB.
    """
    # We must SHA-256 the plain password first to match the storage format
    sha256_password = hashlib.sha256(plain_password.encode('utf-8')).hexdigest()
    
    # Check against the hash
    return bcrypt.checkpw(
        sha256_password.encode('utf-8'), 
        hashed_password.encode('utf-8')
    )
