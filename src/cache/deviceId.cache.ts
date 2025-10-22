import { redisClient } from "../redis/client";
import Redis from "ioredis";

export class deviceId {
  private readonly redisClient: Redis;
  constructor() {
    this.redisClient = redisClient;
  }
  protected prefix = "device_id";

  private readonly TTL_SECONDS = 600; // 10 mint
  public storeDeviceid = async (
    sessionID: string,
    deviceId: string
  ): Promise<void> => {
    await this.redisClient.set(
      `${this.prefix}:${sessionID}`,
      deviceId,
      "EX",
      86400
    );
  };

  public getDeviceid = async (sessionID: string) => {
    return this.redisClient.get(`${this.prefix}:${sessionID}`);
  };

  public delAllDeviceid = async (sessionID: string) => {
    return this.redisClient.del(`${this.prefix}:${sessionID}`);
  };
}
