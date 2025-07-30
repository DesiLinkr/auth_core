import { SessionServiceServer } from "../generated/session";
import { UserServer } from "../generated/user";
import { UserHandlers } from "../handlers/user.handler";

const userHandlers = new UserHandlers();
export const userServiceHandlers: UserServer = {
  getUserInfoById: userHandlers.genrateUserInfo,
};
