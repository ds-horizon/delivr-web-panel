import { useMutation } from "react-query";
import { promoteRelease } from "../data/promoteRelease";
import { notifications } from "@mantine/notifications";
import { AxiosError } from "axios";

export const usePromoteRelease = () => {
  return useMutation(promoteRelease, {
    onError: (e) => {
      notifications.show({
        color: "red",
        title: "Deployment Promotion",
        message:
          (e as AxiosError<{ message: string }>)?.response?.data?.message ??
          "Error While promoting deployment",
      });
    },
  });
};
