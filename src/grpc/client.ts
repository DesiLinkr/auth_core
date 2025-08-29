// client.service.ts
import { credentials } from "@grpc/grpc-js";
import { SessionServiceClient } from "./generated/session";
import { AccessServiceClient } from "./generated/access";

const sessionClient = new SessionServiceClient(
  "localhost:5052",
  credentials.createInsecure()
);

const accessClient = new AccessServiceClient(
  "localhost:5052",
  credentials.createInsecure()
);

export const grpcClient = {
  session: sessionClient,
  accessVerifier: accessClient,
};
