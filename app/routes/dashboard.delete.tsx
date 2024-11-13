import { Button, Flex, Modal, Text } from "@mantine/core";
import { useNavigate } from "@remix-run/react";

export default function Profile() {
  const navigation = useNavigate();
  return (
    <Modal
      opened={true}
      onClose={() => {
        navigation(-1);
      }}
      title="Delete Account"
      centered
    >
      <Text>Are you sure you want to delete your account ?</Text>
      <Flex justify={"flex-end"} mt={"lg"}>
        <Button color="red">Delete</Button>
      </Flex>
    </Modal>
  );
}
