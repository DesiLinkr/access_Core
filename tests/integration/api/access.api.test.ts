import request from "supertest";
import App from "../../../src/app";
const app = new App().getInstance();

import { AccessService } from "../../../src/services/access.service";
import { TokenUtil } from "../../../src/utils/token.util";
let validAccessToken: string;
describe("GET /api/access/token/refresh", () => {
  const accessTokenService = new AccessService();
  const token = new TokenUtil();
  const refresh_token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiN2Y3ZjVhNDktYTlkOC00ZDgyLWE3MDMtZjk1OGNkZDhjODY4IiwiaWF0IjoxNzU1Njg4OTkwLCJleHAiOjE3NTYyOTM3OTB9.GtIY2Webo3FC0t4rON0iSz9-kxYhjcbrVkIEYWmYIx0";

  it("should return 500 if unexpected error occurs during verification", async () => {
    jest
      .spyOn(accessTokenService, "generateFromRefresh")
      .mockImplementation(() => {
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
  it("should return 403 if session does not match current device or IP", async () => {
    const res = await request(app)
      .get("/api/access/token/refresh")
      .set("User-Agent", "wrong-agent")
      .set("x-forwarded-for", "0.0.0.0")
      .set("Cookie", [`refresh_token=${refresh_token}`]);
    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      message: "Session does not match with current device OR expired",
    });
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
  });

  it("should return 401 if token does not match stored encrypted token", async () => {
    const res = await request(app)
      .get("/api/access/token/refresh")
      .set("User-Agent", "integration-test")
      .set("x-forwarded-for", "127.0.0.1")
      .set("Cookie", [
        `refresh_token=${token.genrateRefeshToken(
          "7f7f5a49-a9d8-4d82-a703-f958cdd8c868"
        )}`,
      ]);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      message: "Invalid session",
    });
  });
});

describe("GET /api/access/me ", () => {
  it("should return user info for valid token/session", async () => {
    const res = await request(app)
      .get("/api/access/me")
      .set("Authorization", `Bearer ${validAccessToken}`)
      .set("User-Agent", "integration-test")
      .set("X-Forwarded-For", "127.0.0.1");

    expect(res.statusCode).toBe(200);
  });

  it("should return 401 when no token is provided", async () => {
    const res = await request(app).get("/api/access/me");
    expect(res.statusCode).toBe(401);
  });

  it("should return 403 for invalid session IP/user-agent", async () => {
    const res = await request(app)
      .get("/api/access/me")
      .set("Authorization", `Bearer ${validAccessToken}`)
      .set("User-Agent", "FakeAgent/1.0")
      .set("X-Forwarded-For", "1.2.3.4");

    expect(res.statusCode).toBe(403);
  });
});
