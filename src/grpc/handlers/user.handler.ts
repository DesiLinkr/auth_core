import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import { AuthRepository } from "../../repositories/auth.repository";
import { UserInfoRequest, UserInfoResponse } from "../generated/user";

export class UserHandlers {
  private readonly authRepo;
  constructor() {
    this.authRepo = new AuthRepository();
  }
  public genrateUserInfo = async (
    call: ServerUnaryCall<UserInfoRequest, UserInfoResponse>,
    callback: sendUnaryData<UserInfoResponse>
  ) => {
    try {
      const { userId: id } = call.request;
      const result: any = await this.authRepo.findUserInfoById(id);
      callback(null, result);
    } catch (error: any) {
      callback(error, null);
    }
  };
}
