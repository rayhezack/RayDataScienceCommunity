#!/usr/bin/env python3
import argparse
import sys

from auth_service import AuthError, create_invite_code
from database import init_db


def build_parser():
    parser = argparse.ArgumentParser(description="Manage course membership invite codes.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    create_parser = subparsers.add_parser("create", help="Create a hashed invite code.")
    create_parser.add_argument("--code", required=True, help="Plain invite code shared with students.")
    create_parser.add_argument("--max-uses", type=int, default=1, help="Maximum redemption count.")
    create_parser.add_argument("--expires-at", help="Expiration date in YYYY-MM-DD format.")

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()
    init_db()

    try:
        if args.command == "create":
            result = create_invite_code(
                code=args.code,
                max_uses=args.max_uses,
                expires_at=args.expires_at,
            )
            print(
                f"Created invite code {result['code']} "
                f"(max uses: {result['maxUses']}, expires: {result['expiresAt'] or 'never'})"
            )
            return 0
    except AuthError as error:
        print(f"Error: {error.message}", file=sys.stderr)
        return 1

    parser.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
