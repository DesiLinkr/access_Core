import { Server, ServerCredentials, ChannelCredentials } from "@grpc/grpc-js";
import {
  SessionServiceClient,
  CreateSessionRequest,
} from "../../../src/grpc/generated/session";
import { createGrpcServer } from "../../../src/grpc/server";
import { v4 as uuidv4 } from "uuid";

const GRPC_PORT = 50051;
const GRPC_ADDR = `localhost:${GRPC_PORT}`;

let server: Server;

describe("gRPC SessionService integration", () => {
  let client: SessionServiceClient;

  beforeAll(async () => {
    // Start the gRPC server
    server = await createGrpcServer();
    await new Promise<void>((resolve, reject) => {
      server.bindAsync(
        GRPC_ADDR,
        ServerCredentials.createInsecure(),
        (err, port) => {
          if (err) return reject(err);
          server.start();
          resolve();
        }
      );
    });
    client = new SessionServiceClient(
      GRPC_ADDR,
      ChannelCredentials.createInsecure()
    );
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.tryShutdown(() => resolve());
    });
  });

  it("should create a session and return a refresh token", (done) => {
    const request: CreateSessionRequest = {
      userId: uuidv4(), // <-- Use a valid UUID
      ip: "127.0.0.1",
      userAgent: "integration-test",
    };

    client.createSession(request, (err, response) => {
      expect(err).toBeNull();
      expect(response).toBeDefined();
      expect(response?.refreshToken).toBeDefined();
      done();
    });
  });

  // Add more integration tests for other methods as needed
});
