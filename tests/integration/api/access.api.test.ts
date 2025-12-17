import request from "supertest";
import App from "../../../src/app";
const app = new App().getInstance();

import { AccessService } from "../../../src/services/access.service";
import { TokenUtil } from "../../../src/utils/token.util";
let validAccessToken: string;
const accessService = new AccessService();
describe("GET /api/access/token/refresh", () => {
  const token = new TokenUtil();
  const refresh_token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYmE5ZGVlNjQtNzRmNi00ZWY0LWFiZDQtNWY2NmMyNTVlNWQ4IiwiaWF0IjoxNzU2MzY5ODA3LCJleHAiOjE3NTY5NzQ2MDd9.7XfOY-Svreqoy8OB9stpjFsDvRiwgRQkzz3-oG-zhuA";
  it("should return 500 if unexpected error occurs during verification", async () => {
    jest.spyOn(accessService, "generateFromRefresh").mockImplementation(() => {
      throw new Error("Unexpected DB failure");
    });

    const res = await request(app)
      .get("/api/access/token/refresh")
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1")
      .set("Cookie", [
        `refresh_token=${token.genrateRefeshToken("___%%%###BAD")}`,
      ]);
    expect(res.status).toBe(500);
  });

  it("should return 400 for missing refresh token", async () => {
    const res = await request(app)
      .get("/api/access/token/refresh")
      .set("User-Agent", "test-agent")
      .set("x-forwarded-for", "127.0.0.1");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "Missing or invalid refresh token",
    });
  });

  it("should return 400 for invalid refresh token format", async () => {
    const res = await request(app)
      .get("/api/access/token/refresh")
      .set("User-Agent", "test-agent")
      .set("x-forwarded-for", "127.0.0.1")
      .set("Cookie", [`refresh_token="bad.token"`]);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "Missing or invalid refresh token",
    });
  });

  it("should return 200 for valid refresh token and matching session", async () => {
    const res = await request(app)
      .get("/api/access/token/refresh")
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1")
      .set("Cookie", [`refresh_token=${refresh_token}`]); // <-- wrapped in quotes

    expect(res.status).toBe(200);

    validAccessToken = res.body.access_token;

    console.log(res.body.access_token);
  });

  it("should return 401 if token does not match stored encrypted token", async () => {
    const res = await request(app)
      .get("/api/access/token/refresh")
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1")
      .set("Cookie", [
        `refresh_token=${token.genrateRefeshToken(
          "ba9dee64-74f6-4ef4-abd4-5f66c255e5d8"
        )}`,
      ]);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      message: "Invalid session",
    });
  });
});

describe("GET /api/access/history", () => {
  it("should return history for valid token/session", async () => {
    const res = await request(app)
      .get("/api/access/history")
      .set("Authorization", `Bearer ${validAccessToken}`)
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");

    expect(res.statusCode).toBe(200);
  });
  it("should return 401 for invalid token", async () => {
    const res = await request(app)
      .get("/api/access/history")
      .set("Authorization", "Bearer invalidtoken");

    expect(res.status).toBe(401);
  });
  it("should return 403 for invalid session IP/user-agent", async () => {
    const res = await request(app)
      .get("/api/access/history")
      .set("Authorization", `Bearer ${validAccessToken}`)
      .set("User-Agent", "FakeAgent/1.0")
      .set("X-Forwarded-For", "1.2.3.4");

    expect(res.statusCode).toBe(403);
  });
});
