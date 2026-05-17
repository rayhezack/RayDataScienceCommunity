import hashlib
import re
import secrets
from datetime import datetime, timedelta, timezone

from werkzeug.security import check_password_hash, generate_password_hash

from database import get_connection


SESSION_COOKIE_NAME = "session"
SESSION_DAYS = 30
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class AuthError(Exception):
    def __init__(self, message, status_code=400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def now_utc():
    return datetime.now(timezone.utc)


def to_iso(value):
    return value.astimezone(timezone.utc).isoformat()


def parse_iso_date(value):
    if not value:
        return None
    return datetime.strptime(value, "%Y-%m-%d").replace(tzinfo=timezone.utc)


def normalize_email(email):
    email = (email or "").strip().lower()
    if not EMAIL_PATTERN.match(email):
        raise AuthError("Valid email is required")
    return email


def validate_password(password):
    if not password or len(password) < 8:
        raise AuthError("Password must be at least 8 characters")


def hash_secret(value):
    normalized = (value or "").strip()
    if not normalized:
        raise AuthError("Invite code is required")
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def user_payload(user):
    return {
        "email": user["email"],
        "membershipStatus": user["membership_status"],
        "role": user["role"],
    }


def create_invite_code(code, max_uses=1, expires_at=None):
    code = (code or "").strip()
    if not code:
        raise AuthError("Invite code is required")
    if max_uses < 1:
        raise AuthError("max_uses must be at least 1")

    code_hash = hash_secret(code)
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO invite_codes (code_hash, max_uses, expires_at)
            VALUES (?, ?, ?)
            """,
            (code_hash, max_uses, expires_at),
        )
    return {"code": code, "maxUses": max_uses, "expiresAt": expires_at}


def find_user_by_email(email):
    with get_connection() as connection:
        return connection.execute(
            "SELECT * FROM users WHERE email = ?",
            (email,),
        ).fetchone()


def find_user_by_id(user_id):
    with get_connection() as connection:
        return connection.execute(
            "SELECT * FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()


def create_session(user_id):
    token = secrets.token_urlsafe(32)
    token_hash = hash_secret(token)
    expires_at = to_iso(now_utc() + timedelta(days=SESSION_DAYS))

    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO sessions (user_id, token_hash, expires_at)
            VALUES (?, ?, ?)
            """,
            (user_id, token_hash, expires_at),
        )
    return token, expires_at


def get_user_for_session(token):
    if not token:
        return None

    token_hash = hash_secret(token)
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT users.*
            FROM sessions
            JOIN users ON users.id = sessions.user_id
            WHERE sessions.token_hash = ?
              AND sessions.revoked_at IS NULL
              AND sessions.expires_at > ?
            """,
            (token_hash, to_iso(now_utc())),
        ).fetchone()
    return row


def revoke_session(token):
    if not token:
        return

    token_hash = hash_secret(token)
    with get_connection() as connection:
        connection.execute(
            """
            UPDATE sessions
            SET revoked_at = ?
            WHERE token_hash = ? AND revoked_at IS NULL
            """,
            (to_iso(now_utc()), token_hash),
        )


def redeem_invite_for_user(user_id, invite_code):
    code_hash = hash_secret(invite_code)
    current_time = to_iso(now_utc())

    with get_connection() as connection:
        invite = connection.execute(
            """
            SELECT *
            FROM invite_codes
            WHERE code_hash = ?
            """,
            (code_hash,),
        ).fetchone()

        if not invite or not invite["is_active"]:
            raise AuthError("Invite code is invalid")
        if invite["used_count"] >= invite["max_uses"]:
            raise AuthError("Invite code is no longer available")
        if invite["expires_at"] and invite["expires_at"] < current_time[:10]:
            raise AuthError("Invite code has expired")

        connection.execute(
            """
            INSERT INTO invite_redemptions (invite_code_id, user_id)
            VALUES (?, ?)
            """,
            (invite["id"], user_id),
        )
        connection.execute(
            """
            UPDATE invite_codes
            SET used_count = used_count + 1
            WHERE id = ?
            """,
            (invite["id"],),
        )
        connection.execute(
            """
            UPDATE users
            SET membership_status = 'member', updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (user_id,),
        )


def register_user(email, password, invite_code=None):
    email = normalize_email(email)
    validate_password(password)

    with get_connection() as connection:
        existing_user = connection.execute(
            "SELECT id FROM users WHERE email = ?",
            (email,),
        ).fetchone()
        if existing_user:
            raise AuthError("Email is already registered")

        cursor = connection.execute(
            """
            INSERT INTO users (email, password_hash)
            VALUES (?, ?)
            """,
            (email, generate_password_hash(password)),
        )
        user_id = cursor.lastrowid

    if invite_code:
        try:
            redeem_invite_for_user(user_id, invite_code)
        except AuthError:
            with get_connection() as connection:
                connection.execute("DELETE FROM users WHERE id = ?", (user_id,))
            raise

    return find_user_by_id(user_id)


def login_user(email, password):
    email = normalize_email(email)
    user = find_user_by_email(email)
    if not user or not check_password_hash(user["password_hash"], password or ""):
        raise AuthError("Invalid email or password", 401)
    return user
