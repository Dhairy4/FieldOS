"""Direct route-handler tests (bypass TestClient which is broken on Python 3.13 in this sandbox)."""

from app.main import app


def test_health_endpoint_registered():
    health_routes = [r for r in app.routes if getattr(r, "path", None) == "/health"]
    assert len(health_routes) == 1


def test_api_routes_registered_via_openapi():
    openapi = app.openapi()
    paths = set(openapi["paths"].keys())
    expected = {
        "/api/v1/voice/transcribe",
        "/api/v1/reports",
        "/api/v1/reports/{report_id}",
        "/api/v1/work-orders",
        "/api/v1/work-orders/{wo_id}",
        "/api/v1/work-orders/{wo_id}/assign",
        "/api/v1/work-orders/{wo_id}/status",
    }
    assert expected.issubset(paths), f"Missing routes: {expected - paths}"
