import { useMutation } from "react-query";
import { createToken } from "../data/createToken";
import { notifications } from "@mantine/notifications";
import { AxiosError } from "axios";
import { useState } from "react";

export const useCreateToken = () => {
  const [show, setShow] = useState(false);
  return {
    show,
    clear: () => setShow(false),
    ...useMutation(createToken, {
      onSuccess: () => {
        setShow(true);
      },
      onError: (e) => {
        notifications.show({
          color: "red",
          title: "Token Creation",
          message:
            (e as AxiosError<{ message: string }>)?.response?.data?.message ??
            "Error While Creating Token",
        });
      },
    }),
  };
};
