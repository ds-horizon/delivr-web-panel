import { useMutation } from "react-query";
import { notifications } from "@mantine/notifications";
import { AxiosError } from "axios";
import { createApp } from "../data/createApp";

export const useCreateApp = () => {
  return useMutation(createApp, {
    onError: (e) => {
      notifications.show({
        color: "red",
        title: "App Creation",
        message:
          (e as AxiosError<{ message: string }>)?.response?.data?.message ??
          "Error While Creating App",
      });
    },
  });
};
