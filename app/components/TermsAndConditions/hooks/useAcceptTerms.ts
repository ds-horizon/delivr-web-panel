import { useMutation, useQueryClient } from "react-query";
import { TERMS_QUERY_KEYS } from "../constants/termsConstants";
import { acceptTerms } from "../data/acceptTerms";

export const useAcceptTerms = () => {
  const queryClient = useQueryClient();

  return useMutation(acceptTerms, {
    onSuccess: () => {
      // Invalidate and refetch terms status after successful acceptance
      queryClient.invalidateQueries(TERMS_QUERY_KEYS.OWNER_STATUS);
    },
  });
};
