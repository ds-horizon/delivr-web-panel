import { useEffect } from "react";
import {
  Card,
  Stack,
  Group,
  Text,
  Badge,
  Box,
  Progress,
  Skeleton,
  Grid,
  ThemeIcon,
  RingProgress,
  Divider,
  Paper,
  Title,
} from "@mantine/core";
import {
  IconRocket,
  IconDevices,
  IconDownload,
  IconAlertTriangle,
  IconCalendar,
  IconCheck,
  IconTrendingUp,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useGetReleaseListForDeployment } from "./hooks/useGetReleaseListForDeployment";
import { useParams, useSearchParams, useNavigate } from "@remix-run/react";
import { ReleaseListResponse } from "./data/getReleaseListForDeployment";

// Format file size
const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// Format relative time
const formatRelativeTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
};

// Calculate success rate
const getSuccessRate = (installed: number, failed: number) => {
  const total = installed + failed;
  if (total === 0) return 100;
  return Math.round((installed / total) * 100);
};

function ReleaseCard({
  release,
  onClick,
}: {
  release: ReleaseListResponse;
  onClick: () => void;
}) {
  const isActive = release.status;

  return (
    <Card
      withBorder
      padding="md"
      radius="md"
      style={{
        cursor: "pointer",
        transition: "all 200ms ease",
        background: isActive
          ? "linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)"
          : "white",
        borderLeft: isActive ? "4px solid #667eea" : "1px solid #e9ecef",
      }}
      styles={{
        root: {
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 12px 32px rgba(102, 126, 234, 0.15)",
            borderColor: "#667eea",
          },
        },
      }}
      onClick={onClick}
    >
      <Group justify="space-between" wrap="nowrap">
        {/* Left: Icon + Version Info */}
        <Group gap="md" style={{ flex: 1 }}>
          <Box
            style={{
              width: 40,
              height: 40,
              borderRadius: "8px",
              background: isActive
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isActive ? "0 4px 12px rgba(102, 126, 234, 0.3)" : "none",
              flexShrink: 0,
            }}
          >
            <IconRocket size={20} color="white" />
          </Box>
          
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group gap="xs" wrap="nowrap">
              <Text size="lg" fw={700} style={{ lineHeight: 1.2 }}>
                {release.label}
              </Text>
              {isActive && (
                <Badge
                  variant="light"
                  color="green"
                  size="sm"
                  leftSection={<IconCheck size={10} />}
                >
                  Active
                </Badge>
              )}
              {release.mandatory && (
                <Badge
                  variant="light"
                  color="red"
                  size="sm"
                  leftSection={<IconAlertTriangle size={10} />}
                >
                  Mandatory
                </Badge>
              )}
            </Group>
            <Text size="xs" c="dimmed" mt={4}>
              Target: {release.targetVersions} • {formatRelativeTime(release.releasedAt)}
            </Text>
          </Box>
        </Group>

        {/* Right: Rollout Progress */}
        <Group gap="md" wrap="nowrap">
          <Box style={{ minWidth: 200 }}>
            <Group justify="space-between" mb={6}>
              <Text size="xs" c="dimmed" fw={600}>
                Rollout
              </Text>
              <Text size="sm" fw={700} style={{ color: "#667eea" }}>
                {release.rollout}%
              </Text>
            </Group>
            <Progress
              value={release.rollout}
              size="md"
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
          </Box>
          
          <Box style={{ textAlign: "center", minWidth: 80 }}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
              Devices
            </Text>
            <Text size="lg" fw={700} c="blue">
              {release.activeDevices?.toLocaleString() || 0}
            </Text>
          </Box>
        </Group>
      </Group>
    </Card>
  );
}

export function ReleaseListForDeploymentTable() {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data, isLoading, refetch, isFetching, isError } =
    useGetReleaseListForDeployment({
      deploymentName: searchParams.get("deployment") ?? "",
      appId: params.app ?? "",
    });

  useEffect(() => {
    refetch();
  }, [searchParams.get("deployment")]);

  if (isLoading || isFetching) {
    return (
      <Stack gap="md" mt="xl">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} height={80} radius="md" />
          ))}
      </Stack>
    );
  }

  if (isError) {
    return (
      <Card withBorder padding="xl" radius="md" mt="xl" style={{ textAlign: "center" }}>
        <Stack gap="md" align="center">
          <IconAlertCircle size={48} color="#fa5252" />
          <Title order={3} c="red">
            Something Went Wrong
          </Title>
          <Text c="dimmed">Unable to load releases. Please try again later.</Text>
        </Stack>
      </Card>
    );
  }

  if (!data?.length) {
    return (
      <Card withBorder padding="xl" radius="md" mt="xl" style={{ textAlign: "center" }}>
        <Stack gap="md" align="center">
          <IconRocket size={48} color="#ccc" />
          <Title order={3} c="dimmed">
            No Releases Yet
          </Title>
          <Text c="dimmed">
            This deployment doesn't have any releases. Create your first release to get started!
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack gap="md" mt="xl">
      {data.map((release) => (
        <ReleaseCard
          key={release.id}
          release={release}
          onClick={() => {
            navigate(
              `/dashboard/${params.org}/${params.app}/${release.label}?deployment=${searchParams.get("deployment")}`
            );
          }}
        />
      ))}
    </Stack>
  );
}
