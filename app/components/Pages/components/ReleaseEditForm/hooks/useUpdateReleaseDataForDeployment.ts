import { useMutation } from "react-query";
import { updateReleaseDataForDeployment } from "../data/updateReleaseDataForDeployment";
import { notifications } from "@mantine/notifications";
import { AxiosError } from "axios";

export const useUpdateReleaseDataForDeployment = () => {
  return useMutation(updateReleaseDataForDeployment, {
    onError: (e) => {
      notifications.show({
        color: "red",
        title: "Deployment Release Updation",
        message:
          (e as AxiosError<{ message: string }>)?.response?.data?.message ??
          "Error While Updating Release",
      });
    },
  });
};
