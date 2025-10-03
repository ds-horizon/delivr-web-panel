import axios, { AxiosResponse } from "axios";
import type { OwnerTermsStatusResponse } from "~/.server/services/Codepush/types";

export const getOwnerTermsStatus = async (): Promise<OwnerTermsStatusResponse> => {
  const { data } = await axios.get<null, AxiosResponse<OwnerTermsStatusResponse>>(
    "/api/v1/account/owner-terms-status"
  );
  return data;
};
