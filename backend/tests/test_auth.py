"""Authentication and authorization tests."""

import uuid

from app.db.session import SessionLocal
from app.models.user import User


def _login(client, email: str, password: str = "demo1234"):
    return client.post(
        "/api/v1/auth/login", json={"email": email, "password": password}
    )


def test_demo_users_can_log_in(client):
    for email, role in [
        ("tech.demo@fieldos.ai", "technician"),
        ("supervisor.demo@fieldos.ai", "supervisor"),
    ]:
        response = _login(client, email)
        assert response.status_code == 200, response.text
        body = response.json()
        assert body["access_token"]
        assert body["user"]["role"] == role


def test_invalid_password_is_rejected(client):
    response = _login(client, "tech.demo@fieldos.ai", "wrong-password")
    assert response.status_code == 401


def test_unknown_email_is_rejected(client):
    response = _login(client, "nobody@fieldos.ai")
    assert response.status_code == 401


def test_passwords_are_hashed_in_database(client):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "tech.demo@fieldos.ai").first()
        assert user is not None
        assert user.password_hash != "demo1234"
        assert user.password_hash.startswith("$2")
    finally:
        db.close()


def test_register_creates_user_and_returns_token(client):
    email = f"new.{uuid.uuid4().hex[:8]}@fieldos.ai"
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "New Technician",
            "email": email,
            "password": "strongpass123",
            "role": "technician",
            "languagePreference": "hindi",
        },
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["access_token"]
    assert body["user"]["email"] == email

    # The new account can authenticate with its password.
    login = _login(client, email, "strongpass123")
    assert login.status_code == 200


def test_register_rejects_duplicate_email(client):
    email = f"dup.{uuid.uuid4().hex[:8]}@fieldos.ai"
    payload = {
        "name": "Duplicate",
        "email": email,
        "password": "strongpass123",
        "role": "technician",
    }
    assert client.post("/api/v1/auth/register", json=payload).status_code == 200
    assert client.post("/api/v1/auth/register", json=payload).status_code == 409


def test_register_rejects_weak_password(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Weak",
            "email": f"weak.{uuid.uuid4().hex[:8]}@fieldos.ai",
            "password": "123",
            "role": "technician",
        },
    )
    assert response.status_code == 422


def test_register_rejects_invalid_role(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Bad Role",
            "email": f"role.{uuid.uuid4().hex[:8]}@fieldos.ai",
            "password": "strongpass123",
            "role": "superuser",
        },
    )
    assert response.status_code == 422


def test_register_cannot_create_admin(client):
    """Elevated roles must not be self-service assignable."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Wannabe Admin",
            "email": f"admin.{uuid.uuid4().hex[:8]}@fieldos.ai",
            "password": "strongpass123",
            "role": "admin",
        },
    )
    assert response.status_code == 422


def test_seeded_admin_account_is_gone(client):
    """The admin persona was removed from the demo data."""
    assert _login(client, "admin.demo@fieldos.ai").status_code == 401


def test_data_endpoints_require_authentication(client):
    for path in (
        "/api/v1/reports",
        "/api/v1/work-orders",
        "/api/v1/technicians",
        "/api/v1/work-orders/escalation-candidates",
    ):
        response = client.get(path)
        assert response.status_code == 401, f"{path} -> {response.status_code}"


def test_data_endpoints_accept_valid_token(client):
    token = _login(client, "tech.demo@fieldos.ai").json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    reports = client.get("/api/v1/reports", headers=headers)
    assert reports.status_code == 200
    assert isinstance(reports.json()["data"], list)

    technicians = client.get("/api/v1/technicians", headers=headers)
    assert technicians.status_code == 200
    assert len(technicians.json()) >= 4


def test_invalid_token_is_rejected(client):
    response = client.get(
        "/api/v1/reports", headers={"Authorization": "Bearer not-a-real-token"}
    )
    assert response.status_code == 401
