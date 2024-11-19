import { useMutation } from "react-query";

import { notifications } from "@mantine/notifications";
import { AxiosError } from "axios";
import { updateAppCollabarator } from "../data/updateAppCollaborator";

export const useUpdateCollabarator = () => {
  return useMutation(updateAppCollabarator, {
    onError: (e) => {
      notifications.show({
        color: "red",
        title: "Collaborator Updation",
        message:
          (e as AxiosError<{ message: string }>)?.response?.data?.message ??
          "Error While Update Collaborator",
      });
    },
  });
};
