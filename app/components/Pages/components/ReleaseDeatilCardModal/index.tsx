import { Modal } from "@mantine/core";
import { ReleaseDetailCard } from "../ReleaseDetailCard";

export type ReleaseDeatilCardModalProps = {
  opened: boolean;
  id: string | null;
  close: () => void;
  deploymentName?: string;
};

export const ReleaseDeatilCardModal = ({
  opened,
  id,
  close,
  deploymentName,
}: ReleaseDeatilCardModalProps) => {
  return id ? (
    <Modal
      opened={opened}
      onClose={close}
      title={`Release Details (${deploymentName ?? ""})`}
      centered
      size={"xl"}
    >
      <ReleaseDetailCard id={id} />
    </Modal>
  ) : (
    <></>
  );
};
