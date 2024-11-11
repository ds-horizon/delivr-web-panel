import { Modal } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { CreateAppForm } from "~/components/Pages/components/CreateApp";

export default function IntroPage() {
  const navigation = useNavigate();
  return (
    <Modal
      opened={true}
      onClose={() => {
        navigation("/dashboard");
      }}
      title="Create App Flow"
      centered
    >
      <CreateAppForm />
    </Modal>
  );
}
