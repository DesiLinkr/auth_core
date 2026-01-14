import { grpcClient } from "../grpc/client";
import {
  CreateSessionRequest,
  CreateSessionResponse,
  delsessionsRequest,
  delsessionsResponse,
} from "../grpc/generated/access";
import {
  AccessVerifierRequest,
  AccessVerifierResponse,
} from "../grpc/generated/access";

import {
  AccessEmailRequest,
  emailServiceResponse,
  ForgotPasswordRequest,
  VerificationEmailRequest,
} from "../grpc/generated/email";
import { error } from "console";
import { response } from "express";
import axios from "axios";
import { Customformat } from "./timeformat";

export function createSession(
  request: CreateSessionRequest
): Promise<CreateSessionResponse> {
  return new Promise((resolve, reject) => {
    grpcClient.access.createSession(request, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

export const sendVerificationEmail = (
  request: VerificationEmailRequest
): Promise<emailServiceResponse> => {
  return new Promise((resolve, reject) => {
    grpcClient.email.sendVerificationEmail(request, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};
export const AccessVerifier = (
  request: AccessVerifierRequest
): Promise<AccessVerifierResponse> => {
  return new Promise((resolve, reject) => {
    grpcClient.access.verify(request, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};
export const sendforgotPassword = (
  request: ForgotPasswordRequest
): Promise<emailServiceResponse> => {
  return new Promise((resolve, reject) => {
    grpcClient.email.sendforgotPassword(request, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

export const delAllsessions = (
  request: delsessionsRequest
): Promise<delsessionsResponse> => {
  return new Promise((resolve, reject) => {
    grpcClient.access.delAllsessions(request, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

export const sendAcesssEmail = async (
  request: AccessEmailRequest
): Promise<emailServiceResponse> => {
  try {
    // Fetch IP location using ipapi.co

    // Wrap gRPC call in a Promise for await support
    return await new Promise((resolve, reject) => {
      grpcClient.email.sendAcesssEmail(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  } catch (err: any) {
    console.error("Error in sendAcesssEmail:", err.message);
    throw err;
  }
};
