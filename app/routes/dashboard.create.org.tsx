import { Modal } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { CreateOrgModal } from "~/components/Pages/components/OrgsPage/components/CreateOrgModal";
import { ACTION_EVENTS, actions } from "~/utils/event-emitter";

export default function CreateOrgPage() {
  const navigation = useNavigate();

  const handleSuccess = () => {
    actions.trigger(ACTION_EVENTS.REFETCH_ORGS);
    navigation(-1);
  };

  return (
    <Modal
      opened={true}
      onClose={() => {
        navigation(-1);
      }}
      title="Create Organization"
      centered
    >
      <CreateOrgModal onSuccess={handleSuccess} />
    </Modal>
  );
}
