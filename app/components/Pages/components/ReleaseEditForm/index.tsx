import { useForm } from "@mantine/form";
import {
  TextInput,
  Button,
  Group,
  Textarea,
  Modal,
  Switch,
  Slider,
  Text,
  Box,
  Flex,
  Tooltip,
  Overlay,
  Stack,
  Paper,
  Title,
  rem,
  Alert,
  Divider,
} from "@mantine/core";
import { ReleaseListResponse } from "../ReleaseListForDeploymentTable/data/getReleaseListForDeployment";
import { useNavigate, useParams, useSearchParams } from "@remix-run/react";
import { IconHelpOctagon, IconEdit, IconInfoCircle, IconSparkles } from "@tabler/icons-react";
import { useUpdateReleaseDataForDeployment } from "./hooks/useUpdateReleaseDataForDeployment";

type ReleaseEditProps = { data: ReleaseListResponse; refetch: () => void };

export function ReleaseEditFormModal({ data, refetch }: ReleaseEditProps) {
  const params = useParams();
  const { mutate, isLoading } = useUpdateReleaseDataForDeployment();
  const [serachParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const close = () => {
    setSearchParams((p) => {
      p.delete("edit");
      return p;
    });
  };
  const form = useForm<ReleaseEditProps["data"]>({
    mode: "uncontrolled",
    initialValues: data,
    validateInputOnChange: true,
    validate: {
      description: (value) => {
        return value.length ? null : "Description Can't be Empty";
      },
      targetVersions: (value) => {
        return value.length ? null : "Target Versions Can't be Empty";
      },
    },
  });

  const onSubmit = () => {
    const data = form.getValues();
    mutate(
      {
        appId: params.app ?? "",
        deploymentName: serachParams.get("deployment") ?? "",
        appVersion: data.targetVersions,
        description: data.description,
        isDisabled: !data.status,
        isMandatory: data.mandatory,
        label: data.label,
        rollout: data.rollout,
        tenant: params.org ?? "",
      },
      {
        onSuccess: () => {
          refetch();
          close();
        },
      }
    );
  };

  return (
    <Modal
      opened={
        !!serachParams.get("edit") &&
        serachParams.get("edit") === "true"
      }
      onClose={close}
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
            <IconEdit size={20} color="white" />
          </Box>
          <Title order={3}>Edit Release</Title>
        </Group>
      }
    >
      {isLoading && <Overlay color="gray" backgroundOpacity={0.3} />}
      
      <Stack gap="lg">
        <Alert 
          icon={<IconInfoCircle size={18} />} 
          color="violet"
          variant="light"
          radius="md"
        >
          Update release configuration and rollout settings for version <Text component="span" fw={600}>{data.label}</Text>
        </Alert>

        {/* Release Label (Read-only) */}
        <Paper withBorder p="md" radius="md" bg="gray.0">
          <Stack gap="xs">
            <Text size="sm" fw={600} c="dimmed">
              Release Label
            </Text>
            <Text size="md" fw={500}>
              {data.label}
            </Text>
          </Stack>
        </Paper>

        <Divider />

        {/* Editable Fields */}
        <Stack gap="md">
          <Textarea
            label="Description"
            placeholder="Enter release description..."
            description="Provide details about this release"
            key={form.key("description")}
            {...form.getInputProps("description")}
            minRows={3}
            styles={{
              input: {
                "&:focus": {
                  borderColor: "#667eea",
                },
              },
            }}
          />

          <TextInput
            label="Target Version"
            placeholder="e.g., 1.0.0"
            description="App version this release targets"
            key={form.key("targetVersions")}
            {...form.getInputProps("targetVersions")}
            styles={{
              input: {
                "&:focus": {
                  borderColor: "#667eea",
                },
              },
            }}
          />

          <Divider />

          {/* Rollout Section */}
          <Box>
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <Text size="sm" fw={600}>
                  Rollout Percentage
                </Text>
                <Tooltip 
                  label="Rollout can only be increased, not decreased" 
                  color="violet"
                  withArrow
                >
                  <IconHelpOctagon size={16} style={{ color: "#667eea" }} />
                </Tooltip>
              </Group>
              <Text
                size="xl"
                fw={700}
                style={{
                  color: "#667eea",
                }}
              >
                {form.getValues().rollout}%
              </Text>
            </Group>
            <Slider
              value={form.getValues().rollout}
              max={100}
              min={data.rollout}
              step={1}
              onChange={(value) => {
                form.setFieldValue("rollout", value);
              }}
              marks={[
                { value: data.rollout, label: `${data.rollout}%` },
                { value: 100, label: "100%" },
              ]}
              styles={{
                track: {
                  background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                },
                thumb: {
                  borderWidth: 2,
                  borderColor: "#667eea",
                  backgroundColor: "white",
                },
                markLabel: {
                  fontSize: rem(12),
                },
              }}
            />
            <Text size="xs" c="dimmed" mt="xs">
              Current rollout: {data.rollout}% → Can increase to 100%
            </Text>
          </Box>

          <Divider />

          {/* Switches */}
          <Group grow>
            <Paper withBorder p="md" radius="md">
              <Switch
                label={
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>
                      Release Status
                    </Text>
                    <Text size="xs" c="dimmed">
                      {form.getValues().status ? "Active" : "Inactive"}
                    </Text>
                  </Stack>
                }
                checked={form.getValues().status}
                {...form.getInputProps("status")}
                color="violet"
                size="md"
              />
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Switch
                label={
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>
                      Mandatory Update
                    </Text>
                    <Text size="xs" c="dimmed">
                      {form.getValues().mandatory ? "Required" : "Optional"}
                    </Text>
                  </Stack>
                }
                checked={form.getValues().mandatory}
                {...form.getInputProps("mandatory")}
                color="violet"
                size="md"
              />
            </Paper>
          </Group>
        </Stack>

        {/* Action Buttons */}
        <Group justify="space-between" mt="md">
          <Button
            variant="subtle"
            color="gray"
            onClick={close}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            leftSection={<IconSparkles size={18} />}
            onClick={onSubmit}
            disabled={!!Object.keys(form.errors).length}
            loading={isLoading}
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
            Save Changes
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
