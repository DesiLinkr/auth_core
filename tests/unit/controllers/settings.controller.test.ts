// __tests__/controllers/settings.controller.test.ts
import { Request, Response } from "express";
import { SettingsController } from "../../../src/controllers/settings.controller";
import { SettingsService } from "../../../src/services/settings.service";

jest.mock("../../../src/services/settings.service");

describe("SettingsController", () => {
  let controller: SettingsController;
  let mockService: jest.Mocked<SettingsService>;
  let mockReq: Partial<Request>;
  let fakereq: Partial<Request>;
  let mock: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mocked service instance
    mockService = {
      changePassword: jest.fn(),
      addEmail: jest.fn(),
      removeEmail: jest.fn(),
    } as unknown as jest.Mocked<SettingsService>;

    // @ts-ignore override real service with mock
    controller = new SettingsController();
    (controller as any).SettingsService = mockService;

    mockReq = {
      body: { oldPassword: "oldpassword", newPassword: "newPassword123" },
      userId: "user-1", // custom injected in middleware
    } as any;
    // Fake req/res
    fakereq = {
      body: { email: "mock@example.com" },
      userId: "user123", // custom injected in middleware
    } as any;

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should  it call service with correct parms ", async () => {
    await controller.changepassword(mockReq as Request, mockRes as Response);

    expect(mockService.changePassword).toHaveBeenCalledWith(
      "user-1",
      "newPassword123",
      "oldpassword"
    );
  });

  it("should handle errors and return 500", async () => {
    (mockService.changePassword as jest.Mock).mockRejectedValue(
      new Error("DB error")
    );

    await controller.changepassword(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith("DB error");
  });

  it("should call addEmail service with correct params", async () => {
    mockReq.body = { email: "test@example.com" };

    (mockService.addEmail as jest.Mock).mockResolvedValue({
      message: "email added",
    });

    await controller.addNewEmail(mockReq as Request, mockRes as Response);

    expect(mockService.addEmail).toHaveBeenCalledWith(
      "user-1",
      "test@example.com"
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "email added" });
  });

  it("should return error message with proper status if service returns error", async () => {
    mockReq.body = { email: "duplicate@example.com" };

    (mockService.addEmail as jest.Mock).mockResolvedValue({
      error: "email already exists",
      status: 409,
    });

    await controller.addNewEmail(mockReq as Request, mockRes as Response);

    expect(mockService.addEmail).toHaveBeenCalledWith(
      "user-1",
      "duplicate@example.com"
    );
    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "email already exists",
    });
  });

  it("should handle unexpected errors and return 500", async () => {
    (mockService.addEmail as jest.Mock).mockRejectedValue(
      new Error("unexpected error")
    );

    await controller.addNewEmail(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith("unexpected error");
  });

  it("should respond with error message and status when result contains error", async () => {
    mockService.removeEmail.mockResolvedValue({
      error: "email does not exits",
      status: 403,
    });

    await controller.removeEmail(fakereq as Request, mockRes as Response);

    expect(mockService.removeEmail).toHaveBeenCalledWith(
      "user123",
      "mock@example.com"
    );
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "email does not exits",
    });
  });

  it("should respond with 500 if service throws error", async () => {
    mockService.removeEmail.mockRejectedValue(new Error("DB error"));

    await controller.removeEmail(fakereq as Request, mockRes as Response);

    expect(mockService.removeEmail).toHaveBeenCalledWith(
      "user123",
      "mock@example.com"
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith("DB error");
  });

  it("should not call res.status if no error in result", async () => {
    mockService.removeEmail.mockResolvedValue({
      message: "email removed successful",
    });

    await controller.removeEmail(fakereq as Request, mockRes as Response);

    expect(mockService.removeEmail).toHaveBeenCalledWith(
      "user123",
      "mock@example.com"
    );
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });
});
