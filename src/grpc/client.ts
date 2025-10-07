// client.service.ts
import { credentials } from "@grpc/grpc-js";
import { SessionServiceClient } from "./generated/session";
import { AccessServiceClient } from "./generated/access";
import { EmailClient } from "./generated/email";

const Acess_core = process.env.Acess_core_grpc_URL || "localhost:5052";
const email_service = process.env.email_service || "localhost:4692";
const sessionClient = new SessionServiceClient(
  Acess_core,
  credentials.createInsecure()
);

const accessClient = new AccessServiceClient(
  Acess_core,
  credentials.createInsecure()
);
const emailClient = new EmailClient(
  email_service,
  credentials.createInsecure()
);

export const grpcClient = {
  session: sessionClient,
  accessVerifier: accessClient,
  email: emailClient,
};
