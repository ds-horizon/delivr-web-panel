import { useMutation } from "react-query";
import { createToken } from "../data/createToken";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { handleApiError } from "~/utils/handleApiError";

export const useCreateToken = () => {
  const [show, setShow] = useState(false);
  const mutation = useMutation(createToken, {
    onSuccess: () => {
      setShow(true);
    },
    onError: (e) => {
      notifications.show({
        color: "red",
        title: "Token Creation",
        message: handleApiError(e, "Error While Creating Token"),
      });
    },
  });
  return {
    show,
    clear: () => setShow(false),
    ...mutation,
  };
};
