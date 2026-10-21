"""Create a super admin, or promote an existing account to super admin.

No API endpoint can create the first super admin, so run this once from the
backend folder (after `alembic upgrade head`):

    python create_superadmin.py you@example.com                 # promote existing user
    python create_superadmin.py you@example.com --name "Your Name"   # create (asks for password)
"""
import argparse
import getpass
import sys

import models  # noqa: F401  (registers all models)
from config.db import SessionLocal
from config.permissions import Roles
from config.security import hash_password
from models.user import User


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("email")
    parser.add_argument("--name", help="Full name (required when creating a new account)")
    parser.add_argument("--password", help="Password for a new account (prompted if omitted)")
    args = parser.parse_args()

    email = args.email.strip().lower()
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.role = Roles.SUPER_ADMIN
            user.is_active = True
            db.commit()
            print(f"{user.name} <{email}> is now a super admin.")
            return 0

        if not args.name:
            print(f"No account with email {email}. Pass --name to create one.", file=sys.stderr)
            return 1
        password = args.password or getpass.getpass("Password (min 8 chars): ")
        if len(password) < 8:
            print("Password must be at least 8 characters.", file=sys.stderr)
            return 1
        db.add(User(
            name=args.name.strip(),
            email=email,
            password_hash=hash_password(password),
            role=Roles.SUPER_ADMIN,
        ))
        db.commit()
        print(f"Created super admin {args.name} <{email}>.")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
