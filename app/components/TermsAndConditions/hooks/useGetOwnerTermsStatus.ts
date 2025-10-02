import { useQuery } from "react-query";
import { TERMS_CACHE_CONFIG, TERMS_QUERY_KEYS } from "../constants/termsConstants";
import { getOwnerTermsStatus } from "../data/getOwnerTermsStatus";

export const useGetOwnerTermsStatus = () => {
  return useQuery(
    TERMS_QUERY_KEYS.OWNER_STATUS,
    getOwnerTermsStatus,
    {
      retry: TERMS_CACHE_CONFIG.RETRY_COUNT,
      staleTime: TERMS_CACHE_CONFIG.STALE_TIME,
    }
  );
};
