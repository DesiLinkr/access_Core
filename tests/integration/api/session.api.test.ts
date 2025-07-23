import request from "supertest";
import App from "../../../src/app";
import { TokenUtil } from "../../../src/utils/token.util";
import { SessionService } from "../../../src/services/session.service";
const app = new App().getInstance();
const sessionService = new SessionService();
describe("GET /api/access/session/verify", () => {
  const token = new TokenUtil();
  const refresh_token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmEyZGE0MDYtNTE4YS00NjY3LThiZDgtZTE0NmI5YmQxMTU4IiwiaWF0IjoxNzUzMjU1OTU4fQ.3_eGmQeq65LUHO4N-REQgAbBNvPIntNgy-9FJuk0hto";

  it("should return 200 for valid refresh token and matching session", async () => {
    const res = await request(app)
      .get("/api/access/session/verify")
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1")
      .set("Cookie", [`refresh_token=${refresh_token}`]); // <-- wrapped in quotes

    expect(res.status).toBe(200);
  });

  it("should return 400 for missing refresh token", async () => {
    const res = await request(app)
      .get("/api/access/session/verify")
      .set("User-Agent", "test-agent")
      .set("x-forwarded-for", "127.0.0.1");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "Missing or invalid refresh token",
    });
  });

  it("should return 400 for invalid refresh token format", async () => {
    const res = await request(app)
      .get("/api/access/session/verify")
      .set("User-Agent", "test-agent")
      .set("x-forwarded-for", "127.0.0.1")
      .set("Cookie", [`refresh_token="bad.token"`]);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "Missing or invalid refresh token",
    });
  });

  it("should return 403 if session does not match current device or IP", async () => {
    const res = await request(app)
      .get("/api/access/session/verify")
      .set("User-Agent", "wrong-agent")
      .set("x-forwarded-for", "0.0.0.0")
      .set("Cookie", [`refresh_token=${refresh_token}`]);
    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      message: "Session does not match with current device OR expired",
    });
  });

  it("should return 401 if token does not match stored encrypted token", async () => {
    const res = await request(app)
      .get("/api/access/session/verify")
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1")
      .set("Cookie", [
        `refresh_token=${token.genrateRefeshToken(
          "fa2da406-518a-4667-8bd8-e146b9bd1158"
        )}`,
      ]);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      message: "Invalid session",
    });
  });

  it("should return 500 if unexpected error occurs during verification", async () => {
    jest.spyOn(sessionService, "verify").mockImplementation(() => {
      throw new Error("Unexpected DB failure");
    });

    const res = await request(app)
      .get("/api/access/session/verify")
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1")
      .set("Cookie", [
        `refresh_token=${token.genrateRefeshToken("___%%%###BAD")}`,
      ]);
    expect(res.status).toBe(500);
  });
});
