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

export const sendAcesssEmail = async (request: {
  name: string;
  to: string;
  secureAccountUrl: string;
  ipAddress: string;
}): Promise<emailServiceResponse> => {
  try {
    // Fetch IP location using ipapi.co
    const res = await axios.get(`https://ipapi.co/${request.ipAddress}/json/`);

    const req: AccessEmailRequest = {
      to: request.to,
      data: {
        location: `${res?.data?.city}, ${res?.data?.country_name}`,
        name: request.name,
        year: `${new Date().getFullYear()}`,
        ipAddress: request.ipAddress,
        secureAccountUrl: request.secureAccountUrl,
        dateTime: `${Customformat(new Date())}`,
      },
      retry: 0,
    };

    // Wrap gRPC call in a Promise for await support
    return await new Promise((resolve, reject) => {
      grpcClient.email.sendAcesssEmail(req, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  } catch (err: any) {
    console.error("Error in sendAcesssEmail:", err.message);
    throw err;
  }
};
