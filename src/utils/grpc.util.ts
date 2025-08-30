import { grpcClient } from "../grpc/client";
import {
  CreateSessionRequest,
  CreateSessionResponse,
} from "../grpc/generated/session";
import {
  AccessVerifierRequest,
  AccessVerifierResponse,
} from "../grpc/generated/access";

export function createSessionGrpc(
  request: CreateSessionRequest
): Promise<CreateSessionResponse> {
  return new Promise((resolve, reject) => {
    grpcClient.session.createSession(request, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

export const AccessVerifier = (
  request: AccessVerifierRequest
): Promise<AccessVerifierResponse> => {
  return new Promise((resolve, reject) => {
    grpcClient.accessVerifier.verify(request, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};
