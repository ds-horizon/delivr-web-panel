import { Button, Flex, Modal, Text } from "@mantine/core";
import { useNavigate, useSearchParams } from "@remix-run/react";

export type DeletePageTypes =
  | {
      type: "Profile";
      id: never;
      name: never;
    }
  | {
      type: "App";
      id: string;
      name: string;
    }
  | {
      type: "Organization";
      id: string;
      name: string;
    };

export default function Profile() {
  const navigation = useNavigate();
  const [searchParams] = useSearchParams();
  return (
    <Modal
      opened={true}
      onClose={() => {
        navigation(-1);
      }}
      title={`Delete ${searchParams.get("type")}`}
      centered
    >
      <Text>Are you sure you want to delete {searchParams.get("type")} ?</Text>
      <Flex justify={"flex-end"} mt={"lg"}>
        <Button color="red">Delete</Button>
      </Flex>
    </Modal>
  );
}
