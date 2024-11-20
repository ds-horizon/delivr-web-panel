import { useMutation } from "react-query";

import { notifications } from "@mantine/notifications";
import { AxiosError } from "axios";
import { deleteOrg } from "../data/deleteOrg";

export const useDeleteOrg = () => {
  return useMutation(deleteOrg, {
    onError: (e) => {
      notifications.show({
        color: "red",
        title: "Org Deletion",
        message:
          (e as AxiosError<{ message: string }>)?.response?.data?.message ??
          "Error While Deleting Org",
      });
    },
  });
};
