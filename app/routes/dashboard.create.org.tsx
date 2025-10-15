import { Modal } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { CreateOrgModal } from "~/components/Pages/components/OrgsPage/components/CreateOrgModal";
import { ACTION_EVENTS, actions } from "~/utils/event-emitter";
import { route } from "routes-gen";

export default function CreateOrgPage() {
  const navigation = useNavigate();

  const handleSuccess = () => {
    actions.trigger(ACTION_EVENTS.REFETCH_ORGS);
    navigation(route("/dashboard"));
  };

  return (
    <Modal
      opened={true}
      onClose={() => {
        navigation(route("/dashboard"));
      }}
      title="Create Organization"
      centered
    >
      <CreateOrgModal onSuccess={handleSuccess} />
    </Modal>
  );
}
