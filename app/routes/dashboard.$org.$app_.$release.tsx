import {
  Box,
  Card,
  Grid,
  Group,
  Stack,
  Text,
  Title,
  Badge,
  Progress,
  RingProgress,
  Button,
  Divider,
  Paper,
  ThemeIcon,
  Avatar,
  Skeleton,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconDevices,
  IconDownload,
  IconCheck,
  IconX,
  IconTrendingUp,
  IconAlertCircle,
  IconCalendar,
  IconUser,
  IconFileZip,
  IconRocket,
  IconRotate2,
  IconEdit,
  IconArrowUp,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useNavigate, useParams, useSearchParams, useLoaderData } from "@remix-run/react";
import { User } from "~/.server/services/Auth/Auth.interface";
import { authenticateLoaderRequest } from "~/utils/authenticate";
import { useGetReleaseDataForDeployment } from "~/components/Pages/components/ReleaseDetailCard/hooks/useGetReleaseDataForDeployment";
import { formatDate } from "~/utils/formatDate";
import { ReleaseEditFormModal } from "~/components/Pages/components/ReleaseEditForm";
import { PromoteReleaseForm } from "~/components/Pages/components/PromoteReleaseForm";

export const loader = authenticateLoaderRequest();

// Format file size
const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// Calculate success rate
const getSuccessRate = (installed: number, failed: number) => {
  const total = installed + failed;
  if (total === 0) return 100;
  return Math.round((installed / total) * 100);
};

export default function ReleaseDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useLoaderData<User>();

  const { data, isError, isLoading, isFetching, refetch } =
    useGetReleaseDataForDeployment({
      label: params.release ?? "",
      deploymentName: searchParams.get("deployment") ?? "",
      appId: params.app ?? "",
    });

  if (isLoading || isFetching) {
    return (
      <Box>
        <Skeleton height={40} width={200} mb="xl" />
        <Grid gutter="lg">
          <Grid.Col span={8}>
            <Skeleton height={400} radius="md" />
          </Grid.Col>
          <Grid.Col span={4}>
            <Stack gap="md">
              <Skeleton height={180} radius="md" />
              <Skeleton height={180} radius="md" />
            </Stack>
          </Grid.Col>
        </Grid>
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Card withBorder padding="xl" radius="md" style={{ textAlign: "center" }}>
        <Stack gap="md" align="center">
          <IconAlertCircle size={48} color="#fa5252" />
          <Title order={3} c="red">
            Failed to Load Release
          </Title>
          <Text c="dimmed">Unable to load release details. Please try again later.</Text>
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={18} />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Stack>
      </Card>
    );
  }

  const adoptionPercentage =
    data.totalActive > 0 ? Math.floor((data.activeDevices / data.totalActive) * 100) : 0;
  const rollbackPercentage =
    data.installed > 0 ? Math.floor((data.rollbacks / data.installed) * 100) : 0;
  const successRate = getSuccessRate(data.installed || 0, data.failed || 0);

  return (
    <Box>
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <Group gap="md">
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={() => navigate(-1)}
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Box>
            <Group gap="xs">
              <Title order={2}>{data.label}</Title>
              <Badge
                variant="light"
                color={data.status ? "green" : "gray"}
                size="lg"
                leftSection={data.status ? <IconCheck size={14} /> : <IconX size={14} />}
              >
                {data.status ? "Active" : "Inactive"}
              </Badge>
              {data.mandatory && (
                <Badge
                  variant="light"
                  color="red"
                  size="lg"
                  leftSection={<IconAlertTriangle size={14} />}
                >
                  Mandatory
                </Badge>
              )}
            </Group>
            <Text size="sm" c="dimmed" mt={4}>
              {data.description || "No description provided"}
            </Text>
          </Box>
        </Group>

        <Group gap="sm">
          <Button
            leftSection={<IconEdit size={18} />}
            variant="light"
            onClick={() => setSearchParams((p) => { p.set("edit", "true"); return p; })}
          >
            Edit
          </Button>
          <Button
            leftSection={<IconArrowUp size={18} />}
            variant="gradient"
            gradient={{ from: "#667eea", to: "#764ba2", deg: 135 }}
            onClick={() => setSearchParams((p) => { p.set("promote", "true"); return p; })}
          >
            Promote
          </Button>
        </Group>
      </Group>

      <Grid gutter="lg">
        {/* Left Column - Main Stats */}
        <Grid.Col span={8}>
          <Stack gap="lg">
            {/* Overview Stats */}
            <Card withBorder padding="lg" radius="md">
              <Title order={4} mb="md">
                Overview
              </Title>
              <Grid gutter="md">
                <Grid.Col span={3}>
                  <Paper p="md" radius="md" style={{ background: "#f0f8ff", border: "1px solid #4facfe" }}>
                    <Stack gap="xs">
                      <Group gap="xs">
                        <ThemeIcon size="md" variant="light" color="blue" radius="xl">
                          <IconDevices size={18} />
                        </ThemeIcon>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                          Active Devices
                        </Text>
                      </Group>
                      <Text size="xl" fw={700} c="blue">
                        {data.activeDevices?.toLocaleString() || 0}
                      </Text>
                      <Text size="xs" c="dimmed">
                        of {data.totalActive?.toLocaleString() || 0} total
                      </Text>
                    </Stack>
                  </Paper>
                </Grid.Col>

                <Grid.Col span={3}>
                  <Paper p="md" radius="md" style={{ background: "#f0fffa", border: "1px solid #06d6a0" }}>
                    <Stack gap="xs">
                      <Group gap="xs">
                        <ThemeIcon size="md" variant="light" color="teal" radius="xl">
                          <IconDownload size={18} />
                        </ThemeIcon>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                          Downloads
                        </Text>
                      </Group>
                      <Text size="xl" fw={700} c="teal">
                        {data.downloaded?.toLocaleString() || 0}
                      </Text>
                      <Text size="xs" c="dimmed">
                        total downloads
                      </Text>
                    </Stack>
                  </Paper>
                </Grid.Col>

                <Grid.Col span={3}>
                  <Paper p="md" radius="md" style={{ background: "#f0fff4", border: "1px solid #43e97b" }}>
                    <Stack gap="xs">
                      <Group gap="xs">
                        <ThemeIcon size="md" variant="light" color="green" radius="xl">
                          <IconCheck size={18} />
                        </ThemeIcon>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                          Installed
                        </Text>
                      </Group>
                      <Text size="xl" fw={700} c="green">
                        {data.installed?.toLocaleString() || 0}
                      </Text>
                      <Text size="xs" c="dimmed">
                        successful installs
                      </Text>
                    </Stack>
                  </Paper>
                </Grid.Col>

                <Grid.Col span={3}>
                  <Paper p="md" radius="md" style={{ background: "#fff5f5", border: "1px solid #fa709a" }}>
                    <Stack gap="xs">
                      <Group gap="xs">
                        <ThemeIcon size="md" variant="light" color="red" radius="xl">
                          <IconAlertCircle size={18} />
                        </ThemeIcon>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                          Failed
                        </Text>
                      </Group>
                      <Text size="xl" fw={700} c="red">
                        {data.failed?.toLocaleString() || 0}
                      </Text>
                      <Text size="xs" c="dimmed">
                        installation failures
                      </Text>
                    </Stack>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Card>

            {/* Rollout Progress */}
            <Card withBorder padding="lg" radius="md">
              <Group justify="space-between" mb="md">
                <Title order={4}>Rollout Progress</Title>
                <Group gap="xs">
                  <Text size="sm" fw={600} c="dimmed">
                    Target:
                  </Text>
                  <Text size="lg" fw={700} style={{ color: "#667eea" }}>
                    {data.rollout}%
                  </Text>
                </Group>
              </Group>
              <Progress
                value={data.rollout}
                size="xl"
                radius="xl"
                styles={{
                  root: {
                    background: "#e9ecef",
                  },
                  section: {
                    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                  },
                }}
              />
              <Text size="xs" c="dimmed" mt="md">
                This release is being rolled out to {data.rollout}% of your user base
              </Text>
            </Card>

            {/* Performance Metrics */}
            <Card withBorder padding="lg" radius="md">
              <Title order={4} mb="md">
                Performance Metrics
              </Title>
              <Grid gutter="lg">
                <Grid.Col span={4}>
                  <Box style={{ textAlign: "center" }}>
                    <RingProgress
                      size={180}
                      thickness={16}
                      sections={[{ value: adoptionPercentage, color: "#06d6a0" }]}
                      label={
                        <Stack gap={0} align="center">
                          <Text size="xl" fw={700} c="teal">
                            {adoptionPercentage}%
                          </Text>
                          <Text size="xs" c="dimmed">
                            Adoption
                          </Text>
                        </Stack>
                      }
                    />
                    <Text size="sm" fw={500} mt="md">
                      Active Adoption Rate
                    </Text>
                    <Text size="xs" c="dimmed">
                      {data.activeDevices?.toLocaleString()} of {data.totalActive?.toLocaleString()} devices
                    </Text>
                  </Box>
                </Grid.Col>

                <Grid.Col span={4}>
                  <Box style={{ textAlign: "center" }}>
                    <RingProgress
                      size={180}
                      thickness={16}
                      sections={[{ value: successRate, color: "#43e97b" }]}
                      label={
                        <Stack gap={0} align="center">
                          <Text size="xl" fw={700} c="green">
                            {successRate}%
                          </Text>
                          <Text size="xs" c="dimmed">
                            Success
                          </Text>
                        </Stack>
                      }
                    />
                    <Text size="sm" fw={500} mt="md">
                      Installation Success
                    </Text>
                    <Text size="xs" c="dimmed">
                      {data.installed?.toLocaleString()} successful, {data.failed?.toLocaleString()} failed
                    </Text>
                  </Box>
                </Grid.Col>

                <Grid.Col span={4}>
                  <Box style={{ textAlign: "center" }}>
                    <RingProgress
                      size={180}
                      thickness={16}
                      sections={[{ value: rollbackPercentage, color: "#fa709a" }]}
                      label={
                        <Stack gap={0} align="center">
                          <Text size="xl" fw={700} c="red">
                            {rollbackPercentage}%
                          </Text>
                          <Text size="xs" c="dimmed">
                            Rollback
                          </Text>
                        </Stack>
                      }
                    />
                    <Text size="sm" fw={500} mt="md">
                      Rollback Rate
                    </Text>
                    <Text size="xs" c="dimmed">
                      {data.rollbacks?.toLocaleString()} rollbacks from {data.installed?.toLocaleString()} installs
                    </Text>
                  </Box>
                </Grid.Col>
              </Grid>
            </Card>
          </Stack>
        </Grid.Col>

        {/* Right Column - Metadata & Actions */}
        <Grid.Col span={4}>
          <Stack gap="lg">
            {/* Release Info */}
            <Card withBorder padding="lg" radius="md">
              <Title order={4} mb="md">
                Release Information
              </Title>
              <Stack gap="md">
                <Box>
                  <Group gap="xs" mb={4}>
                    <IconRocket size={16} color="#667eea" />
                    <Text size="sm" c="dimmed" fw={600}>
                      Version
                    </Text>
                  </Group>
                  <Text size="md" fw={500}>
                    {data.targetVersions}
                  </Text>
                </Box>

                <Divider />

                <Box>
                  <Group gap="xs" mb={4}>
                    <IconCalendar size={16} color="#667eea" />
                    <Text size="sm" c="dimmed" fw={600}>
                      Released At
                    </Text>
                  </Group>
                  <Text size="md" fw={500}>
                    {formatDate(data.releasedAt)}
                  </Text>
                </Box>

                <Divider />

                <Box>
                  <Group gap="xs" mb={4}>
                    <IconUser size={16} color="#667eea" />
                    <Text size="sm" c="dimmed" fw={600}>
                      Released By
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <Avatar
                      name={data.releasedBy}
                      color="initials"
                      size="sm"
                      radius="xl"
                    />
                    <Text size="sm" fw={500}>
                      {data.releasedBy}
                    </Text>
                  </Group>
                </Box>

                {data.size && (
                  <>
                    <Divider />
                    <Box>
                      <Group gap="xs" mb={4}>
                        <IconFileZip size={16} color="#667eea" />
                        <Text size="sm" c="dimmed" fw={600}>
                          Package Size
                        </Text>
                      </Group>
                      <Text size="md" fw={500}>
                        {formatBytes(data.size)}
                      </Text>
                    </Box>
                  </>
                )}

                {data.rollbacks > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <Group gap="xs" mb={4}>
                        <IconRotate2 size={16} color="#fa709a" />
                        <Text size="sm" c="dimmed" fw={600}>
                          Rollbacks
                        </Text>
                      </Group>
                      <Badge variant="light" color="orange" size="lg">
                        {data.rollbacks} rollbacks
                      </Badge>
                    </Box>
                  </>
                )}
              </Stack>
            </Card>

            {/* Quick Stats */}
            <Card withBorder padding="lg" radius="md">
              <Title order={4} mb="md">
                Quick Stats
              </Title>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Success Rate
                  </Text>
                  <Group gap="xs">
                    <IconTrendingUp size={16} color="#43e97b" />
                    <Text size="sm" fw={700} c="green">
                      {successRate}%
                    </Text>
                  </Group>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Adoption
                  </Text>
                  <Text size="sm" fw={700} c="teal">
                    {adoptionPercentage}%
                  </Text>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Total Devices
                  </Text>
                  <Text size="sm" fw={700}>
                    {data.totalActive?.toLocaleString() || 0}
                  </Text>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Method
                  </Text>
                  <Badge variant="light" size="sm">
                    {data.releaseMethod || "Manual"}
                  </Badge>
                </Group>
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Modals */}
      <ReleaseEditFormModal data={data} refetch={refetch} />
      <PromoteReleaseForm release={data} refetch={refetch} />
    </Box>
  );
}

