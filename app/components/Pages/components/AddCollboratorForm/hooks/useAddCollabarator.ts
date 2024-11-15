import { useMutation } from "react-query";

import { notifications } from "@mantine/notifications";
import { AxiosError } from "axios";
import { addCollabarator } from "../data/addCollabarator";

export const useAddCollabarator = () => {
  return useMutation(addCollabarator, {
    onError: (e) => {
      notifications.show({
        color: "red",
        title: "Collaborator Addition",
        message:
          (e as AxiosError<{ message: string }>)?.response?.data?.message ??
          "Error While Adding Collaborator",
      });
    },
  });
};
