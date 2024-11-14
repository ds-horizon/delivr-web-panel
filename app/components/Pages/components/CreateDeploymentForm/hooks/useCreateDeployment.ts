import { useMutation } from "react-query";
import { createDeployment } from "../data/createDeployment";
import { notifications } from "@mantine/notifications";
import { AxiosError } from "axios";

export const useCreateDeployment = () => {
  return useMutation(createDeployment, {
    onError: (e) => {
      console.log(e);
      notifications.show({
        color: "red",
        title: "Deployment Creation",
        message:
          (e as AxiosError<{ message: string }>)?.response?.data?.message ??
          "Error While Creating Deployment",
      });
    },
  });
};
