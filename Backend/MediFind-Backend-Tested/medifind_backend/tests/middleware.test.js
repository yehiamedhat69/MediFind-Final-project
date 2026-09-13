const jwt = require("jsonwebtoken");
const authMiddleware = require("../src/middleware/authMiddleware");
const requireRole = require("../src/middleware/roleMiddleware");

const response = () => ({
  statusCode: 200,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

describe("Authentication and authorization middleware", () => {
  beforeEach(() => { process.env.JWT_SECRET = "test-secret"; });

  test("rejects missing Authorization header", () => {
    const req = { headers: {} };
    const res = response();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Authentication token is required");
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects malformed/invalid token", () => {
    const req = { headers: { authorization: "Bearer invalid-token" } };
    const res = response();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid authentication token");
  });

  test("accepts a valid token and sets req.user", () => {
    const token = jwt.sign({ id: "123", role: "user" }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = response();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user.id).toBe("123");
    expect(req.user.role).toBe("user");
  });

  test("rejects a role that is not allowed", () => {
    const req = { user: { role: "user" } };
    const res = response();
    const next = jest.fn();

    requireRole("pharmacy")(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("allows an authorized role", () => {
    const req = { user: { role: "pharmacy" } };
    const res = response();
    const next = jest.fn();

    requireRole("pharmacy")(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
