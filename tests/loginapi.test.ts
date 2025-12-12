import createApp from '../src/app';
import request from 'supertest';
import { connectDB, pool } from '../src/config/db';

const app = createApp();

//TESTS WILL FAIL IF HARD CODED VALUES ARE WRONG OR USER USED IN TESTING IS NOT IN THE DATABASE

describe("GET /api/ping", () => {
    it("should return pong", async () => {
        const res = await request(app).get("/api/ping");
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe("pong");
    });
});

// Run backend in docker or locally otherwise tests fail (lazy solution)
// Login api test ------------------------------------------------------------------------------------------------------------------------
describe("POST /api/auth/login", () => {
    beforeAll(async () => {
        await connectDB();
        await pool.query(`
            INSERT INTO TurvaUser (organization_id, profile_name, email_address)
            VALUES ( 1, 'testerAccount1', 'tester10@turva.back.fi')
            ON CONFLICT DO NOTHING;
          `);
    });

    it("should fail without email", async () => {
        const partialPayload = {
            "username": "tester"
        }
        const res = await request(app)
            .post("/api/auth/login")
            .send(partialPayload);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("No email address received");
    });

    it("should fail without username", async () => {
        const partialPayload = {
            "email": "tester@turva.back.fi",
        }

        const res = await request(app)
            .post("/api/auth/login")
            .send(partialPayload);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("No username received");
    });

    it("should fail with invalid email domain", async () => {
        const payload = {
            "email": "tester@test.com",
            "username": "tester"
        }

        const res = await request(app)
            .post("/api/auth/login")
            .send(payload);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Email address is not valid");
    });

    it("should succeed with a valid email address", async () => {
        const payload = {
            "email": "tester10@turva.back.fi",
            "username": "testerAccount1"
        }

        const res = await request(app)
            .post("/api/auth/login")
            .send(payload);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Login email sent to tester10@turva.back.fi");
    });

});

describe("POST api/auth/verify", () => {
    beforeAll(async () => {
        await connectDB();
    });

    it("Should fail without a pin", async () => {
        const emptyPayload = {

        }
        const res = await request(app)
            .post("/api/auth/verify")
            .send(emptyPayload);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("No verification code received.");
    });

    it("should fail with a wrong pin", async () => {
        const payload = {
            "email": "tester10@turva.back.fi",
            "username": "testerAccount1",
            "verificationCode": "123456"
        }

        const res = await request(app)
            .post("/api/auth/verify")
            .send(payload);

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Code is invalid.");
    });

    it("should pass with correct pin", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { });

        const res = await request(app)
            .post("/api/auth/login")
            .send({
                "email": "tester10@turva.back.fi",
                "username": "testerAccount1"
            });

        expect(res.status).toBe(200);
        expect(consoleSpy).toHaveBeenCalled();

        const pinCode = consoleSpy.mock.calls[2][0];

        const payload = {
            "email": "tester10@turva.back.fi",
            "username": "testerAccount1",
            "verificationCode": pinCode
        }

        const verifyRes = await request(app)
            .post("/api/auth/verify")
            .send(payload);

        expect(verifyRes.status).toBe(200);
        expect(verifyRes.body.message).toBe("Login successful!");
        expect(verifyRes.body.token).not.toBeNull();
    });

    it("should fail with correct pin and wrong email", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { });

        const res = await request(app)
            .post("/api/auth/login")
            .send({
                "email": "tester10@turva.back.fi",
                "username": "testerAccount1"
            });

        expect(res.status).toBe(200);
        const pinCode = consoleSpy.mock.calls[0][0];

        const payload = {
            "email": "tester2@turva.back.fi",
            "username": "testuser",
            "verificationCode": pinCode
        }

        const verifyRes = await request(app)
            .post("/api/auth/verify")
            .send(payload);

        expect(verifyRes.status).toBe(401);
        expect(verifyRes.body.error).toBe("Code is invalid.")
    });
});
