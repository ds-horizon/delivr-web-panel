import axios, { AxiosResponse } from "axios";
import { route } from "routes-gen";
import { CreateAccessKeyResponse } from "~/.server/services/Codepush/types";

type CreateTokenArgs = {
  name: string;
};

export const createToken = async ({ name }: CreateTokenArgs) => {
  const { data } = await axios.post<
    null,
    AxiosResponse<CreateAccessKeyResponse>
  >(route("/api/v1/access-keys"), {
    name,
  });

  return data.accessKey;
};
