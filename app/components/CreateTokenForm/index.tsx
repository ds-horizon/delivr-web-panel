import {
  Button,
  Center,
  TextInput,
  Box,
  Modal,
  NativeSelect,
} from "@mantine/core";
import { useForm } from "@mantine/form";

export type CreateTokenFormProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateTokenForm({ open, onClose }: CreateTokenFormProps) {
  const form = useForm<{ name: string; access: "READ" | "WRITE" }>({
    mode: "uncontrolled",
    initialValues: { name: "Enter Name", access: "READ" },
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

          <NativeSelect
            label="Access Type"
            data={["Read", "Write"]}
            mt={"md"}
            key={form.key("access")}
            {...form.getInputProps("access")}
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
