import { Button, Center, TextInput, Box, Modal, Select } from "@mantine/core";
import { useForm } from "@mantine/form";

export type CreateTokenFormProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateTokenForm({ open, onClose }: CreateTokenFormProps) {
  const form = useForm<{ name: string }>({
    mode: "uncontrolled",
    initialValues: { name: "Enter Name" },
    validateInputOnChange: true,
    validate: {
      name: (value) => {
        return value.length ? null : "Name  Can't be Empty";
      },
    },
  });
  return (
    <Modal opened={open} onClose={onClose} title={"Create Token Flow"}>
      <Center>
        <Box w={"300px"}>
          <TextInput
            label="Enter Token Name"
            placeholder="Token Name"
            key={form.key("name")}
            {...form.getInputProps("name")}
            mt={"md"}
          />

          <Select
            label="Access Type"
            placeholder="Pick value"
            data={["Read", "Write"]}
            mt={"md"}
          />

          <Button
            color="blue"
            fullWidth
            mt="md"
            radius="md"
            disabled={!!Object.keys(form.errors).length}
          >
            Create Token
          </Button>
        </Box>
      </Center>
    </Modal>
  );
}
