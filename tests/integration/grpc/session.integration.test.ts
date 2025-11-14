import { Server, ServerCredentials, ChannelCredentials } from "@grpc/grpc-js";
import {
  AccessServiceClient,
  CreateSessionRequest,
  delsessionsRequest,
} from "../../../src/grpc/generated/access";
import { createGrpcServer } from "../../../src/grpc/server";
import { v4 as uuidv4 } from "uuid";
import { Empty } from "../../../src/grpc/generated/google/protobuf/empty";

const GRPC_PORT = 5052;
const GRPC_ADDR = `localhost:${GRPC_PORT}`;

let server: Server;

describe("gRPC SessionService Integration", () => {
  let client: AccessServiceClient;

  beforeAll(async () => {
    // Start gRPC server
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

    // Create client
    client = new AccessServiceClient(
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
      userId: uuidv4(),
      ip: "127.0.0.1",
      userAgent: "integration-test",
    };

    client.createSession(request, (err, response) => {
      console.log(err);

      expect(err).toBeNull();
      expect(response).toBeDefined();
      expect(response?.refreshToken).toBeDefined();
      done();
    });
  });

  it("should delete all sessions for a given user and return success message", (done) => {
    const request: delsessionsRequest = {
      userId: uuidv4(),
    };

    client.delAllsessions(request, (err, response) => {
      expect(err).toBeNull();
      expect(response).toBeDefined();
      expect(response?.msg).toBe("success");
      done();
    });
  });

  it("should delete all expired sessions and return success", (done) => {
    const request: Empty = {};

    client.deleteAllExpiredSessions(request, (err, response) => {
      expect(err).toBeNull();
      expect(response).toBeDefined();
      expect(response?.msg).toBe("expired sessions deleted");
      done();
    });
  });
});
