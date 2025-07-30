import { Server, ServerCredentials, ChannelCredentials } from "@grpc/grpc-js";
import { UserClient, UserInfoRequest } from "../../../src/grpc/generated/user";
import App from "../../../src/app";

const GRPC_PORT = 5051;
const GRPC_ADDR = `localhost:${GRPC_PORT}`;

describe("Integration: findUserInfoById", () => {
  let client: UserClient;

  beforeAll(async () => {
    // Start the gRPC server

    const app = new App();
    app.startServers(8083);
    client = new UserClient(GRPC_ADDR, ChannelCredentials.createInsecure());
  });

  it("should  return user if exits", (done) => {
    const request: UserInfoRequest = {
      userId: "08b926c2-9f98-4877-806f-65d0460b4080", // <-- Use a valid UUID
    };

    client.getUserInfoById(request, (err, response) => {
      expect(err).toBeNull();
      expect(response).toBeDefined();
      expect(response).toBeDefined();
      expect(response).toStrictEqual({
        id: "08b926c2-9f98-4877-806f-65d0460b4080",
        name: "Harsh",
        createdAt: new Date("2025-07-07T15:11:11.534Z"),
        updatedAt: new Date("2025-07-07T15:11:11.534Z"),
        plan: "FREE",
        profileImage: "null",
      });
      done();
    });
  });
  it("should  return null  if user not exits ", (done) => {
    const request: UserInfoRequest = {
      userId: "08b926c2-9f98-4837-806f-65d0460b4080", // <-- Use a valid UUID
    };

    client.getUserInfoById(request, (err, response) => {
      expect(err);
      done();
    });
  });

  // Add more integration tests for other methods as needed
});
