"""Role-based access control: allowed, denied (403) and unauthenticated (401)."""
import pytest
from fastapi import HTTPException

from models.audit_log import AuditLog
from models.user import User
from routes.user import _ensure_not_last_super_admin

# (method, path, json) for every admin-only endpoint.
ADMIN_ENDPOINTS = [
    ("GET", "/api/users/", None),
    ("GET", "/api/roles/", None),
    ("GET", "/api/roles/permissions", None),
    ("GET", "/api/audit-logs/", None),
    ("POST", "/api/users/", {"name": "X", "email": "x@example.com", "password": "Secret123"}),
    ("PUT", "/api/roles/user/permissions", {"permissions": ["products:create"]}),
]


# --- Unauthenticated -> 401 -------------------------------------------------

@pytest.mark.parametrize("method,path,body", ADMIN_ENDPOINTS + [
    ("GET", "/api/auth/me", None),
    ("PATCH", "/api/auth/me", {"name": "x"}),
    ("POST", "/api/products/", {"title": "x", "price": 1}),
])
def test_unauthenticated_gets_401(client, method, path, body):
    assert client.request(method, path, json=body).status_code == 401


def test_invalid_token_gets_401(client):
    res = client.get("/api/auth/me", headers={"Authorization": "Bearer not-a-jwt"})
    assert res.status_code == 401


def test_guest_can_browse_products(client):
    assert client.get("/api/products/").status_code == 200


# --- Denied -> 403 ----------------------------------------------------------

@pytest.mark.parametrize("role", ["user", "editor"])
@pytest.mark.parametrize("method,path,body", ADMIN_ENDPOINTS)
def test_non_admins_are_denied(client, make_user, role, method, path, body):
    headers, _ = make_user(role)
    assert client.request(method, path, json=body, headers=headers).status_code == 403


def test_admin_cannot_use_super_admin_endpoints(client, make_user):
    admin, _ = make_user("admin")
    _, victim = make_user()
    assert client.delete(f"/api/users/{victim['id']}", headers=admin).status_code == 403
    assert client.put("/api/roles/user/permissions", json={"permissions": []}, headers=admin).status_code == 403


# --- Allowed ----------------------------------------------------------------

def test_sign_up_is_plain_user(client, make_user):
    headers, user = make_user()
    me = client.get("/api/auth/me", headers=headers).json()
    assert me["role"] == "user"
    assert me["permissions"] == ["products:create"]


def test_admin_can_read_users_roles_and_audit(client, make_user):
    admin, _ = make_user("admin")
    for path in ("/api/users/", "/api/roles/", "/api/audit-logs/"):
        assert client.get(path, headers=admin).status_code == 200, path


def test_admin_can_disable_regular_user(client, make_user):
    admin, _ = make_user("admin")
    target_headers, target = make_user()
    res = client.patch(f"/api/users/{target['id']}", json={"is_active": False}, headers=admin)
    assert res.status_code == 200 and res.json()["is_active"] is False
    # Disabled: old token and new logins are refused.
    assert client.get("/api/auth/me", headers=target_headers).status_code == 403
    login = client.post("/api/auth/login", json={"email": target["email"], "password": "Secret123"})
    assert login.status_code == 403


def test_super_admin_can_assign_roles(client, make_user):
    sa, _ = make_user("super_admin")
    _, target = make_user()
    res = client.patch(f"/api/users/{target['id']}/role", json={"role": "editor"}, headers=sa)
    assert res.status_code == 200
    assert res.json()["role"] == "editor"


# --- Products: owner / editor / admin ----------------------------------------

def test_product_permissions_by_role(client, make_user):
    owner, _ = make_user()
    other, _ = make_user()
    editor, _ = make_user("editor")
    admin, _ = make_user("admin")
    pid = client.post("/api/products/", json={"title": "Bike", "price": 50}, headers=owner).json()["id"]

    assert client.patch(f"/api/products/{pid}", json={"price": 1}, headers=other).status_code == 403
    assert client.patch(f"/api/products/{pid}", json={"price": 45}, headers=owner).status_code == 200
    # Editors edit any listing (including featuring it) but can't delete.
    res = client.patch(f"/api/products/{pid}", json={"is_flash_deal": True}, headers=editor)
    assert res.status_code == 200 and res.json()["is_flash_deal"] is True
    assert client.delete(f"/api/products/{pid}", headers=editor).status_code == 403
    assert client.delete(f"/api/products/{pid}", headers=admin).status_code == 204


def test_user_cannot_feature_own_listing(client, make_user):
    owner, _ = make_user()
    res = client.post("/api/products/", json={"title": "Lamp", "price": 9, "is_flash_deal": True, "rating": 5}, headers=owner)
    assert res.json()["is_flash_deal"] is False
    assert res.json()["rating"] == 0


# --- Privilege escalation ----------------------------------------------------

def test_cannot_change_own_role(client, make_user):
    sa, me = make_user("super_admin")
    assert client.patch(f"/api/users/{me['id']}/role", json={"role": "user"}, headers=sa).status_code == 400


def test_profile_update_cannot_change_role(client, make_user):
    headers, _ = make_user()
    res = client.patch("/api/auth/me", json={"name": "New", "role": "super_admin", "is_active": True}, headers=headers)
    assert res.status_code == 200
    assert res.json()["role"] == "user"


def test_admin_cannot_manage_peers_or_hand_out_admin(client, make_user, db):
    sa, _ = make_user("super_admin")
    admin, _ = make_user("admin")
    _, other_admin = make_user("admin")
    _, plain = make_user()

    # Even with roles:assign granted, ranks still apply.
    client.put("/api/roles/admin/permissions", headers=sa, json={"permissions": [
        "users:read", "users:create", "users:update", "roles:read", "roles:assign",
        "products:create", "products:update_any", "products:delete_any", "audit:read",
    ]})
    try:
        assert client.patch(f"/api/users/{plain['id']}/role", json={"role": "admin"}, headers=admin).status_code == 403
        assert client.patch(f"/api/users/{plain['id']}/role", json={"role": "super_admin"}, headers=admin).status_code == 403
        assert client.patch(f"/api/users/{other_admin['id']}", json={"is_active": False}, headers=admin).status_code == 403
        assert client.post("/api/users/", headers=admin, json={
            "name": "E", "email": "esc@example.com", "password": "Secret123", "role": "admin",
        }).status_code == 403
        # Ranked below admin: allowed.
        assert client.patch(f"/api/users/{plain['id']}/role", json={"role": "editor"}, headers=admin).status_code == 200
    finally:
        client.put("/api/roles/admin/permissions", headers=sa, json={"permissions": [
            "users:read", "users:create", "users:update", "roles:read",
            "products:create", "products:update_any", "products:delete_any", "audit:read",
        ]})


def test_roles_manage_cannot_escalate(client, make_user):
    sa, _ = make_user("super_admin")
    admin, _ = make_user("admin")
    original = [r for r in client.get("/api/roles/", headers=sa).json() if r["name"] == "admin"][0]["permissions"]
    client.put("/api/roles/admin/permissions", headers=sa, json={"permissions": original + ["roles:manage"]})
    try:
        # Can't edit its own role level...
        assert client.put("/api/roles/admin/permissions", json={"permissions": original}, headers=admin).status_code == 403
        # ...nor grant a permission it doesn't hold.
        assert client.put("/api/roles/user/permissions", json={"permissions": ["users:delete"]}, headers=admin).status_code == 403
        # Granting what it holds, to a lower role, is fine.
        assert client.put("/api/roles/editor/permissions", json={"permissions": ["products:create", "products:update_any"]}, headers=admin).status_code == 200
    finally:
        client.put("/api/roles/admin/permissions", headers=sa, json={"permissions": original})


def test_super_admin_role_is_locked(client, make_user):
    sa, _ = make_user("super_admin")
    assert client.put("/api/roles/super_admin/permissions", json={"permissions": []}, headers=sa).status_code == 400


def test_cannot_disable_or_delete_self(client, make_user):
    sa, me = make_user("super_admin")
    assert client.patch(f"/api/users/{me['id']}", json={"is_active": False}, headers=sa).status_code == 400
    assert client.delete(f"/api/users/{me['id']}", headers=sa).status_code == 400


def test_last_super_admin_is_protected(db):
    """Defence in depth: the API can't normally reach this, so test the rule directly."""
    supers = db.query(User).filter(User.role == "super_admin", User.is_active.is_(True)).all()
    for extra in supers[1:]:
        extra.is_active = False
    db.flush()
    try:
        with pytest.raises(HTTPException) as exc:
            _ensure_not_last_super_admin(db, supers[0])
        assert exc.value.status_code == 400
    finally:
        db.rollback()


# --- Audit log ------------------------------------------------------------------

def test_role_change_is_audited(client, make_user, db):
    sa, actor = make_user("super_admin")
    _, target = make_user()
    client.patch(f"/api/users/{target['id']}/role", json={"role": "editor"}, headers=sa)
    entry = (
        db.query(AuditLog)
        .filter(AuditLog.action == "user.role_changed", AuditLog.target_id == str(target["id"]))
        .one()
    )
    assert entry.actor_id == actor["id"]
    assert entry.details["before"] == "user" and entry.details["after"] == "editor"
    assert entry.created_at is not None


def test_permission_change_is_audited(client, make_user):
    sa, _ = make_user("super_admin")
    client.put("/api/roles/user/permissions", json={"permissions": []}, headers=sa)
    client.put("/api/roles/user/permissions", json={"permissions": ["products:create"]}, headers=sa)
    logs = client.get("/api/audit-logs/?action=role.permissions_changed", headers=sa).json()
    assert logs[0]["details"]["added"] == ["products:create"]
    assert logs[1]["details"]["removed"] == ["products:create"]


# --- Own profile ----------------------------------------------------------------

def test_change_own_password(client, make_user):
    headers, me = make_user()
    wrong = client.patch("/api/auth/me", json={"current_password": "nope", "new_password": "NewSecret1"}, headers=headers)
    assert wrong.status_code == 400
    ok = client.patch("/api/auth/me", json={"current_password": "Secret123", "new_password": "NewSecret1"}, headers=headers)
    assert ok.status_code == 200
    login = client.post("/api/auth/login", json={"email": me["email"], "password": "NewSecret1"})
    assert login.status_code == 200


# --- Account approval (admin creates -> super admin approves) -------------------

def _create_as(client, headers, email):
    return client.post("/api/users/", headers=headers, json={
        "name": "New Person", "email": email, "password": "Secret123",
    })


def test_admin_created_account_needs_approval(client, make_user):
    admin, admin_user = make_user("admin")
    sa, _ = make_user("super_admin")

    res = _create_as(client, admin, "pending1@example.com")
    assert res.status_code == 201
    created = res.json()
    assert created["approval_status"] == "pending"
    assert created["created_by_email"] == admin_user["email"]

    # Pending accounts can't sign in.
    login = client.post("/api/auth/login", json={"email": "pending1@example.com", "password": "Secret123"})
    assert login.status_code == 403
    assert "approval" in login.json()["detail"]

    # Shows up in the super admin's pending queue.
    pending = client.get("/api/users/?approval_status=pending", headers=sa).json()
    assert created["id"] in [u["id"] for u in pending]

    # Admins can't approve their own requests; super admins can.
    assert client.post(f"/api/users/{created['id']}/approve", headers=admin).status_code == 403
    approved = client.post(f"/api/users/{created['id']}/approve", headers=sa)
    assert approved.status_code == 200 and approved.json()["approval_status"] == "approved"
    login = client.post("/api/auth/login", json={"email": "pending1@example.com", "password": "Secret123"})
    assert login.status_code == 200


def test_super_admin_created_account_is_approved(client, make_user):
    sa, _ = make_user("super_admin")
    assert _create_as(client, sa, "direct1@example.com").json()["approval_status"] == "approved"


def test_rejected_account_cannot_sign_in(client, make_user):
    admin, _ = make_user("admin")
    sa, _ = make_user("super_admin")
    created = _create_as(client, admin, "reject1@example.com").json()
    assert client.post(f"/api/users/{created['id']}/reject", headers=sa).json()["approval_status"] == "rejected"
    # Rejecting twice is refused; nothing to decide any more.
    assert client.post(f"/api/users/{created['id']}/reject", headers=sa).status_code == 400
    login = client.post("/api/auth/login", json={"email": "reject1@example.com", "password": "Secret123"})
    assert login.status_code == 403


def test_approval_is_audited(client, make_user):
    admin, _ = make_user("admin")
    sa, _ = make_user("super_admin")
    created = _create_as(client, admin, "audit-approve@example.com").json()
    client.post(f"/api/users/{created['id']}/approve", headers=sa)
    logs = client.get("/api/audit-logs/?action=user.approved", headers=sa).json()
    assert logs[0]["target_id"] == str(created["id"])


def test_unauthenticated_cannot_approve(client):
    assert client.post("/api/users/1/approve").status_code == 401
