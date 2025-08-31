// client.service.ts
import { credentials } from "@grpc/grpc-js";
import { SessionServiceClient } from "./generated/session";
import { AccessServiceClient } from "./generated/access";

const Acess_core = process.env.Acess_core_grpc_URL || "localhost:5052";
const sessionClient = new SessionServiceClient(
  Acess_core,
  credentials.createInsecure()
);

const accessClient = new AccessServiceClient(
  Acess_core,
  credentials.createInsecure()
);

export const grpcClient = {
  session: sessionClient,
  accessVerifier: accessClient,
};
