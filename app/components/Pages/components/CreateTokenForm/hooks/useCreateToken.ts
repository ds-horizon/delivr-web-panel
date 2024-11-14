import { useMutation } from "react-query";
import { createToken } from "../data/createToken";
import { notifications } from "@mantine/notifications";
import { AxiosError } from "axios";

export const useCreateToken = () => {
  return useMutation(createToken, {
    onError: (e) => {
      console.log(e);
      notifications.show({
        color: "red",
        title: "Token Creation",
        message:
          (e as AxiosError<{ message: string }>)?.response?.data?.message ??
          "Error While Creating Token",
      });
    },
  });
};
