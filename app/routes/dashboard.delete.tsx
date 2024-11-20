import { Modal } from "@mantine/core";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { DeleteAction } from "~/components/Pages/components/DeleteAction";

export default function Profile() {
  const navigation = useNavigate();
  const [searchParams] = useSearchParams();

  const close = () => {
    navigation(-1);
  };

  return (
    <Modal
      opened={true}
      onClose={close}
      title={`Delete ${searchParams.get("type")}`}
      centered
    >
      <DeleteAction onSuccess={close} />
    </Modal>
  );
}
