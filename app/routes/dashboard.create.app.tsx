import { Modal } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { route } from "routes-gen";
import { CreateAppForm } from "~/components/Pages/components/CreateApp";

export default function IntroPage() {
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
      <CreateAppForm />
    </Modal>
  );
}
