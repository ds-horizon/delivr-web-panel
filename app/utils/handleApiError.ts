import { AxiosError } from "axios";

export const handleApiError = (e: unknown, fallback: string): string => {
  try {
    const responseData = (e as AxiosError<{ message?: unknown; error?: unknown }>)?.response?.data;
    
    // Check for both 'message' and 'error' fields (different APIs use different field names)
    const message = responseData?.message ?? responseData?.error;

    if (typeof message === "object") {
      return JSON.stringify(message);
    }

    return message?.toString() ?? fallback;
  } catch (_er) {
    console.log({ e, _er });
    return fallback;
  }
};
