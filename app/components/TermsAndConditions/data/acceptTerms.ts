import axios, { AxiosResponse } from "axios";
import type { AcceptTermsResponse } from "~/.server/services/Codepush/types";

export type AcceptTermsArgs = {
  termsVersion: string;
};

export const acceptTerms = async ({ termsVersion }: AcceptTermsArgs): Promise<AcceptTermsResponse> => {
  const { data } = await axios.post<
    AcceptTermsArgs,
    AxiosResponse<AcceptTermsResponse>
  >("/api/v1/account/accept-terms", { termsVersion });
  return data;
};
