import { Center, TextInput, Box, Modal, useMantineTheme } from "@mantine/core";
import { useForm } from "@mantine/form";

import { useParams } from "@remix-run/react";
import { useAddCollabarator } from "./hooks/useAddCollabarator";
import { CTAButton } from "~/components/CTAButton";

export type AddCollboratorFormProps = {
  open: boolean;
  onClose: () => void;
};

export function AddCollboratorForm({ open, onClose }: AddCollboratorFormProps) {
  const theme = useMantineTheme();
  const params = useParams();
  const { mutate, isLoading } = useAddCollabarator();
  const form = useForm<{ name: string }>({
    mode: "uncontrolled",
    initialValues: { name: "collborator@email.com" },
    validateInputOnChange: true,
    validate: {
      name: (value) => {
        return value.length ? null : "Email  Can't be Empty";
      },
    },
  });

  // Debug log to see what params we're getting
  console.log('AddCollaboratorForm params:', { app: params.app, org: params.org });

  return (
    <Modal opened={open} onClose={onClose} title={"Add Collborator"} centered>
      <Center>
        <Box w={"300px"}>
          <TextInput
            label="Enter Email"
            placeholder="collborator@email.com"
            key={form.key("name")}
            {...form.getInputProps("name")}
            mt={"md"}
            disabled={isLoading}
            styles={{
              input: {
                "&:focus": {
                  borderColor: theme.other.brand.primary,
                },
              },
            }}
          />
          <CTAButton
            fullWidth
            mt="md"
            disabled={!!Object.keys(form.errors).length && !isLoading}
            loading={isLoading}
            onClick={() => {
              console.log('Submitting with:', {
                appId: params.app,
                tenant: params.org,
                email: form.getValues().name,
              });
              mutate(
                {
                  appId: params.app ?? "",
                  tenant: params.org ?? "",
                  email: form.getValues().name,
                },
                {
                  onSuccess: () => {
                    onClose();
                    form.reset();
                  },
                }
              );
            }}
          >
            Add Collaborator
          </CTAButton>
        </Box>
      </Center>
    </Modal>
  );
}
