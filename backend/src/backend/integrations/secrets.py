"""Secret encryption for integration credentials using Fernet.

Set BRIAN_INTEGRATION_ENCRYPTION_KEY to a Fernet key generated with
`python -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())'`.
The key must be backed up separately from the database.
"""
import os
from cryptography.fernet import Fernet, InvalidToken

class SecretStoreError(RuntimeError): pass

def _fernet() -> Fernet:
    key = os.getenv("BRIAN_INTEGRATION_ENCRYPTION_KEY")
    if not key:
        raise SecretStoreError("BRIAN_INTEGRATION_ENCRYPTION_KEY is not configured")
    try: return Fernet(key.encode("ascii"))
    except (ValueError, UnicodeEncodeError): raise SecretStoreError("Integration encryption key is invalid") from None

def encrypt_secret(value: str) -> str:
    if not value: raise ValueError("Secret cannot be empty")
    return _fernet().encrypt(value.encode("utf-8")).decode("ascii")

def decrypt_secret(value: str) -> str:
    try: return _fernet().decrypt(value.encode("ascii")).decode("utf-8")
    except (InvalidToken, ValueError, UnicodeEncodeError): raise SecretStoreError("Stored secret cannot be decrypted; verify encryption key") from None
