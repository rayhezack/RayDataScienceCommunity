import importlib
import os
import tempfile
import unittest


class AuthFlowTest(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path = os.path.join(self.temp_dir.name, "auth-test.db")
        os.environ["AUTH_DB_PATH"] = self.db_path
        os.environ["SESSION_COOKIE_SECURE"] = "0"

        import app

        self.app_module = importlib.reload(app)
        self.client = self.app_module.app.test_client()

    def tearDown(self):
        self.temp_dir.cleanup()
        os.environ.pop("AUTH_DB_PATH", None)
        os.environ.pop("SESSION_COOKIE_SECURE", None)

    def create_invite(self, code="COURSE2026", max_uses=1, expires_at="2099-01-01"):
        result = self.app_module.create_invite_code(
            code=code,
            max_uses=max_uses,
            expires_at=expires_at,
        )
        self.assertEqual(result["code"], code)

    def test_member_resources_require_login(self):
        response = self.client.get("/api/member/resources")

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json()["error"], "Authentication required")

    def test_free_registered_user_cannot_access_member_resources(self):
        register = self.client.post(
            "/api/auth/register",
            json={"email": "free@example.com", "password": "password123"},
        )
        self.assertEqual(register.status_code, 201)

        response = self.client.get("/api/member/resources")

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error"], "Membership required")

    def test_register_with_valid_invite_creates_member(self):
        self.create_invite()

        register = self.client.post(
            "/api/auth/register",
            json={
                "email": "member@example.com",
                "password": "password123",
                "inviteCode": "COURSE2026",
            },
        )
        self.assertEqual(register.status_code, 201)
        self.assertEqual(register.get_json()["user"]["membershipStatus"], "member")

        resources = self.client.get("/api/member/resources")

        self.assertEqual(resources.status_code, 200)
        self.assertEqual(
            [feature["id"] for feature in resources.get_json()["features"]],
            ["course-qa", "resume-optimizer", "course-materials"],
        )

    def test_invite_cannot_be_reused_beyond_max_uses(self):
        self.create_invite(max_uses=1)

        first = self.client.post(
            "/api/auth/register",
            json={
                "email": "first@example.com",
                "password": "password123",
                "inviteCode": "COURSE2026",
            },
        )
        self.assertEqual(first.status_code, 201)

        second_client = self.app_module.app.test_client()
        second = second_client.post(
            "/api/auth/register",
            json={
                "email": "second@example.com",
                "password": "password123",
                "inviteCode": "COURSE2026",
            },
        )

        self.assertEqual(second.status_code, 400)
        self.assertEqual(second.get_json()["error"], "Invite code is no longer available")

    def test_invalid_invite_does_not_leave_registered_user(self):
        invalid = self.client.post(
            "/api/auth/register",
            json={
                "email": "bad-invite@example.com",
                "password": "password123",
                "inviteCode": "WRONGCODE",
            },
        )
        self.assertEqual(invalid.status_code, 400)

        retry_without_invite = self.client.post(
            "/api/auth/register",
            json={"email": "bad-invite@example.com", "password": "password123"},
        )

        self.assertEqual(retry_without_invite.status_code, 201)
        self.assertEqual(retry_without_invite.get_json()["user"]["membershipStatus"], "free")

    def test_login_sets_cookie_and_logout_revokes_session(self):
        register = self.client.post(
            "/api/auth/register",
            json={"email": "student@example.com", "password": "password123"},
        )
        self.assertEqual(register.status_code, 201)
        self.client.post("/api/auth/logout")

        login = self.client.post(
            "/api/auth/login",
            json={"email": "student@example.com", "password": "password123"},
        )

        self.assertEqual(login.status_code, 200)
        self.assertIn("session=", login.headers.get("Set-Cookie", ""))
        self.assertEqual(self.client.get("/api/auth/me").get_json()["authenticated"], True)

        logout = self.client.post("/api/auth/logout")

        self.assertEqual(logout.status_code, 200)
        self.assertEqual(self.client.get("/api/auth/me").get_json()["authenticated"], False)

    def test_sample_size_stays_public(self):
        response = self.client.post(
            "/api/sample-size",
            json={
                "metric_type": "mean",
                "baseline": 100,
                "variance": 25,
                "mde": 0.1,
                "daily_traffic": 1000,
                "sample_ratio": 0.1,
                "k": 1,
                "group_num": 2,
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("total_sample_size", response.get_json())


if __name__ == "__main__":
    unittest.main()
