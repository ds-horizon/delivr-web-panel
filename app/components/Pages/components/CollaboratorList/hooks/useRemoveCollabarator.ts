import { useMutation } from "react-query";

import { notifications } from "@mantine/notifications";
import { AxiosError } from "axios";
import { removeAppCollabarator } from "../data/removeAppCollaborator";

export const useRemoveCollabarator = () => {
  return useMutation(removeAppCollabarator, {
    onError: (e) => {
      notifications.show({
        color: "red",
        title: "Collaborator Deletion",
        message:
          (e as AxiosError<{ message: string }>)?.response?.data?.message ??
          "Error While Removing Collaborator",
      });
    },
  });
};
