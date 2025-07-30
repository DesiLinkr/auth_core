import * as grpc from "@grpc/grpc-js";
import { UserService } from "./generated/user";
import { userServiceHandlers } from "./services/user.service";

export async function createGrpcServer() {
  const server = new grpc.Server();
  server.addService(UserService, userServiceHandlers);

  return server;
}
