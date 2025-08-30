// __tests__/controllers/settings.controller.test.ts
import { Request, Response } from "express";
import { SettingsController } from "../../../src/controllers/settings.controller";
import { SettingsService } from "../../../src/services/settings.service";

jest.mock("../../../src/services/settings.service");

describe("SettingsController", () => {
  let controller: SettingsController;
  let mockService: jest.Mocked<SettingsService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mocked service instance
    mockService = {
      changePassword: jest.fn(),
    } as unknown as jest.Mocked<SettingsService>;

    // @ts-ignore override real service with mock
    controller = new SettingsController();
    (controller as any).SettingsService = mockService;

    // Fake req/res
    mockReq = {
      body: { oldPassword: "oldpassword", newPassword: "newPassword123" },
      userId: "user-1", // custom injected in middleware
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
});
