import axios from "axios";
import { env } from "../config";
import { User } from "../Auth/Auth.interface";

class Codepush {
  private __client = axios.create({
    baseURL: env.CODEPUSH_SERVER_URL,
    timeout: 10000,
  });

  async getUser(token: string): Promise<User> {
    if (!env.CODEPUSH_SERVER_URL.length) {
      return Promise.resolve({
        authenticated: true,
        user: {
          createdTime: Date.now(),
          name: "Dummy User",
          email: "dummy_user@dream11.com",
          id: "dummy_user",
          createdAt: "2024-10-30T08:41:07.000Z",
          updatedAt: "2024-10-30T08:41:07.000Z",
        },
      });
    }

    const { data } = await this.__client.get<
      null,
      { status: number; data: User }
    >("/authenticated", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    return data;
  }
}

export const CodepushService = new Codepush();
