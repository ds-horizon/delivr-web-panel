import { useMutation } from "react-query";
import { deleteAppForOrg } from "../data/deleteAppForOrg";
import { notifications } from "@mantine/notifications";
import { AxiosError } from "axios";

export const useDeleteAppForOrg = () => {
  return useMutation(deleteAppForOrg, {
    onError: (e) => {
      notifications.show({
        color: "red",
        title: "App Deletion",
        message:
          (e as AxiosError<{ message: string }>)?.response?.data?.message ??
          "Error While Deleting App",
      });
    },
  });
};
