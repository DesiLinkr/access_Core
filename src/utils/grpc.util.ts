import { grpcClient } from "../grpc/client";
import { UserInfoRequest, UserInfoResponse } from "../grpc/generated/user";

export function getUserInfoById(
  request: UserInfoRequest
): Promise<UserInfoResponse> {
  return new Promise((resolve, reject) => {
    grpcClient.getUserInfoById(request, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}
