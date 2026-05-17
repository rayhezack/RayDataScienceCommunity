import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_DB_PATH = BASE_DIR / "app.db"
SCHEMA_PATH = BASE_DIR / "schema.sql"


def get_db_path():
    return os.environ.get("AUTH_DB_PATH", str(DEFAULT_DB_PATH))


@contextmanager
def get_connection():
    connection = sqlite3.connect(get_db_path())
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        yield connection
        connection.commit()
    finally:
        connection.close()


def init_db():
    with get_connection() as connection:
        connection.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
