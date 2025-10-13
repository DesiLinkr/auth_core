import { Request, Response } from "express";
import ForgotPasswordController from "../../../src/controllers/forgotPassword.controller";
import { ForgotPasswordService } from "../../../src/services/forgotPassword.service";
import { ForgotPasswordTokenCache } from "../../../src/cache/forgotPassword.cache";

// Auto-mock classes
jest.mock("../../../src/services/forgotPassword.service");
jest.mock("../../../src/cache/forgotPassword.cache");

describe("ForgotPasswordController", () => {
  let controller: ForgotPasswordController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  // We'll reassign these to our manually mocked methods
  let mockService: any;
  let mockCache: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // manually create mocks for class methods
    mockService = {
      requestPasswordReset: jest.fn(),
    };

    mockCache = {
      isvaildToken: jest.fn(),
    };

    // create controller and inject mocks
    controller = new ForgotPasswordController();
    // @ts-ignore private fields for testing
    controller.forgotPasswordService = mockService;
    // @ts-ignore private fields for testing
    controller.cache = mockCache;

    mockReq = { body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // -------------------------------------------------------------------------
  // ✅ verifyResetToken
  // -------------------------------------------------------------------------
  it("should return 200 with success true if reset token is valid", async () => {
    mockReq.body = { token: "valid-token" };
    mockCache.isvaildToken.mockResolvedValue(true);

    await controller.verifyResetToken(mockReq as Request, mockRes as Response);

    expect(mockCache.isvaildToken).toHaveBeenCalledWith("valid-token");
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ success: true });
  });

  it("should  send 400 response if reset token is invalid", async () => {
    mockReq.body = { token: "invalid-token" };
    mockCache.isvaildToken.mockResolvedValue(false);

    await controller.verifyResetToken(mockReq as Request, mockRes as Response);

    expect(mockCache.isvaildToken).toHaveBeenCalledWith("invalid-token");
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it("should return 500 if an exception occurs in verifyResetToken", async () => {
    mockReq.body = { token: "any-token" };
    mockCache.isvaildToken.mockRejectedValue(new Error("Redis crash"));

    await controller.verifyResetToken(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith("Internal server error");
  });

  // -------------------------------------------------------------------------
  // ✅ sendPasswordResetToken
  // -------------------------------------------------------------------------
  it("should return 200 and result when ForgotPasswordService succeeds", async () => {
    mockReq.body = { email: "user@example.com" };
    const mockResult = { message: "Reset email sent" };
    mockService.requestPasswordReset.mockResolvedValue(mockResult);

    await controller.sendPasswordResetToken(
      mockReq as Request,
      mockRes as Response
    );

    expect(mockService.requestPasswordReset).toHaveBeenCalledWith(
      "user@example.com"
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockResult);
  });

  it("should return specific error message when service returns { error }", async () => {
    mockReq.body = { email: "notfound@example.com" };
    const errorResult = { error: "User not found", status: 404 };
    mockService.requestPasswordReset.mockResolvedValue(errorResult);

    await controller.sendPasswordResetToken(
      mockReq as Request,
      mockRes as Response
    );

    expect(mockService.requestPasswordReset).toHaveBeenCalledWith(
      "notfound@example.com"
    );
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 500 if an exception occurs in sendPasswordResetToken", async () => {
    mockReq.body = { email: "error@example.com" };
    mockService.requestPasswordReset.mockRejectedValue(
      new Error("Unexpected failure")
    );

    await controller.sendPasswordResetToken(
      mockReq as Request,
      mockRes as Response
    );

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith("Internal server error");
  });
});
