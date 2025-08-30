import { ChannelCredentials } from "@grpc/grpc-js";
import {
  AccessServiceClient,
  AccessVerifierRequest,
} from "../../../src/grpc/generated/access";
import App from "../../../src/app";

const GRPC_PORT = 5052;
const GRPC_ADDR = `localhost:${GRPC_PORT}`;

describe("gRPC AccessService integration", () => {
  let client: AccessServiceClient;

  beforeAll(async () => {
    // Start the real app (which starts the gRPC server inside)
    const app = new App();
    app.startServers(8083); // ensure your app starts both HTTP + gRPC
    client = new AccessServiceClient(
      GRPC_ADDR,
      ChannelCredentials.createInsecure()
    );
  });

  it("should verify token and return a refresh token", (done) => {
    const request: AccessVerifierRequest = {
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYmE5ZGVlNjQtNzRmNi00ZWY0LWFiZDQtNWY2NmMyNTVlNWQ4Iiwic2Vzc2lvbl9pZCI6MTI4LCJpYXQiOjE3NTYzNzY4NjIsImV4cCI6MTc1NjM3Nzc2Mn0._-Eb363TGimNUYHt9e4RvgnVqm8DuOlPydJg0ltYblY",
      ip: "127.0.0.1",
      userAgent: "integration-test",
    };

    client.verify(request, (err, response) => {
      expect(err).toBeNull();
      expect(response).toBeDefined();
      done();
    });
  });

  // Add more integration tests for AccessService methods as needed
});
