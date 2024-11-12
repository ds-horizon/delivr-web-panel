import { Modal } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { route } from "routes-gen";
import { CreateOrgForm } from "~/components/CreateOrgForm";

export default function CreateOrgPage() {
  const navigation = useNavigate();
  return (
    <Modal
      opened={true}
      onClose={() => {
        navigation(route("/dashboard"));
      }}
      title="Create App Flow"
      centered
    >
      <CreateOrgForm />
    </Modal>
  );
}
