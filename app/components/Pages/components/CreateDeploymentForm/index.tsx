import {
  Button,
  TextInput,
  Box,
  Modal,
  rem,
  CopyButton,
  Text,
  Stack,
  Group,
  Paper,
  Title,
  Alert,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconCopy, IconKey, IconInfoCircle, IconSparkles } from "@tabler/icons-react";
import { useCreateDeployment } from "./hooks/useCreateDeployment";
import { useParams } from "@remix-run/react";

export type CreateTokenFormProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateDeploymentForm({ open, onClose }: CreateTokenFormProps) {
  const params = useParams();
  const { mutate, data, isLoading } = useCreateDeployment();
  const form = useForm<{ name: string }>({
    mode: "uncontrolled",
    initialValues: { name: "" },
    validateInputOnChange: true,
    validate: {
      name: (value) => {
        if (!value.length) return "Deployment name is required";
        if (value.length < 3) return "Name must be at least 3 characters";
        if (!/^[a-zA-Z0-9-_]+$/.test(value)) return "Only alphanumeric, dash and underscore allowed";
        return null;
      },
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal 
      opened={open} 
      onClose={handleClose}
      size="lg"
      centered
      title={
        <Group gap="xs">
          <Box
            style={{
              width: rem(36),
              height: rem(36),
              borderRadius: "8px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconKey size={20} color="white" />
          </Box>
          <Title order={3}>Create Deployment Key</Title>
        </Group>
      }
    >
      <Stack gap="lg">
        {!data ? (
          <>
            <Alert 
              icon={<IconInfoCircle size={18} />} 
              color="violet"
              variant="light"
              radius="md"
            >
              Create a new deployment environment for your app (e.g., Production, Staging, Development)
            </Alert>

            <TextInput
              label="Deployment Name"
              placeholder="e.g., Production, Staging, Development"
              description="Choose a unique name for this deployment environment"
              key={form.key("name")}
              {...form.getInputProps("name")}
              disabled={isLoading}
              size="md"
              styles={{
                input: {
                  "&:focus": {
                    borderColor: "#667eea",
                  },
                },
              }}
            />

            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                color="gray"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                leftSection={<IconSparkles size={18} />}
                disabled={!!Object.keys(form.errors).length}
                loading={isLoading}
                onClick={() => {
                  mutate(
                    { ...form.getValues(), appId: params.app ?? "" },
                    {
                      onSuccess: () => {
                        // Don't close immediately - show success state
                      },
                    }
                  );
                }}
                variant="gradient"
                gradient={{ from: "#667eea", to: "#764ba2", deg: 135 }}
                styles={{
                  root: {
                    transition: "all 200ms ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 20px rgba(102, 126, 234, 0.35)",
                    },
                  },
                }}
              >
                Create Deployment
              </Button>
            </Group>
          </>
        ) : (
          <>
            <Paper
              withBorder
              p="xl"
              radius="md"
              style={{
                background: "linear-gradient(135deg, #f8f9fa 0%, #fff 100%)",
                borderColor: "#667eea",
              }}
            >
              <Stack gap="md" align="center">
                <Box
                  style={{
                    width: rem(64),
                    height: rem(64),
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                  }}
                >
                  <IconCheck size={32} color="white" />
                </Box>

                <Stack gap="xs" align="center">
                  <Title order={4} c="gray.9">
                    Deployment Created Successfully!
                  </Title>
                  <Text size="sm" c="dimmed">
                    Your deployment key has been generated
                  </Text>
                </Stack>

                <Divider w="100%" />

                <Stack gap="xs" w="100%">
                  <Text size="sm" fw={500} c="dimmed">
                    Deployment Name
                  </Text>
                  <CopyButton value={data.name}>
                    {({ copied, copy }) => (
                      <>
                        <Button
                          onClick={copy}
                          variant={copied ? "light" : "outline"}
                          color={copied ? "teal" : "violet"}
                          fullWidth
                          size="md"
                          styles={{
                            root: {
                              transition: "all 200ms ease",
                            },
                          }}
                        >
                          <Group justify="space-between" w="100%">
                            <Text
                              size="sm"
                              fw={500}
                              style={{
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                flex: 1,
                              }}
                            >
                              {data.name}
                            </Text>
                            {copied ? (
                              <IconCheck style={{ width: rem(18) }} />
                            ) : (
                              <IconCopy style={{ width: rem(18) }} />
                            )}
                          </Group>
                        </Button>
                        <Text size="xs" c="dimmed" ta="center" mt="xs">
                          {copied ? "✓ Copied to clipboard!" : "Click to copy the deployment name"}
                        </Text>
                      </>
                    )}
                  </CopyButton>
                </Stack>
              </Stack>
            </Paper>

            <Group justify="center">
              <Button
                onClick={() => {
                  form.reset();
                  handleClose();
                }}
                variant="gradient"
                gradient={{ from: "#667eea", to: "#764ba2", deg: 135 }}
                size="md"
                styles={{
                  root: {
                    transition: "all 200ms ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 20px rgba(102, 126, 234, 0.35)",
                    },
                  },
                }}
              >
                Done
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  );
}
