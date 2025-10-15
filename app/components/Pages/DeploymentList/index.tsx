import {
  ActionIcon,
  Card,
  CopyButton,
  Flex,
  rem,
  Skeleton,
  Text,
  Tooltip,
  Group,
  Select,
  useMantineTheme,
  Box,
  Stack,
  SimpleGrid,
  Badge,
  Divider,
  Title,
} from "@mantine/core";
import { useNavigate, useSearchParams, useParams } from "@remix-run/react";
import { useGetDeploymentsForApp } from "./hooks/getDeploymentsForApp";
import { IconCheck, IconCopy, IconTrash, IconKey, IconUser } from "@tabler/icons-react";
import { ReleaseListForDeploymentTable } from "../components/ReleaseListForDeploymentTable";
import { ReleaseDeatilCardModal } from "../components/ReleaseDetailCardModal";
import { useEffect, useMemo } from "react";
import { DeploymentData } from "./data/getDeploymentsForApp";

const DeploymentCard = ({ 
  deployment, 
  isSelected,
  onClick,
  onDelete,
}: { 
  deployment: DeploymentData;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}) => {
  const theme = useMantineTheme();

  return (
    <Card
      withBorder
      padding="md"
      radius="md"
      onClick={onClick}
      style={{
        cursor: "pointer",
        transition: theme.other.transitions.normal,
        borderColor: isSelected ? theme.other.brand.primary : theme.other.borders.primary,
        backgroundColor: isSelected ? theme.other.backgrounds.active : theme.other.backgrounds.primary,
        borderWidth: isSelected ? "2px" : "1px",
      }}
      styles={{
        root: {
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: theme.other.shadows.md,
            borderColor: theme.other.brand.primary,
          },
        },
      }}
    >
      <Group justify="space-between" align="flex-start" mb="sm" wrap="nowrap">
        <Box
          style={{
            width: theme.other.sizes.icon["4xl"],
            height: theme.other.sizes.icon["4xl"],
            borderRadius: theme.other.borderRadius.md,
            background: isSelected ? theme.other.brand.gradient : theme.other.backgrounds.secondary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <IconKey 
            size={theme.other.sizes.icon.xl} 
            color={isSelected ? theme.other.text.white : theme.other.brand.primary}
          />
        </Box>
        
        {isSelected && (
          <Badge
            variant="gradient"
            gradient={{ from: theme.other.brand.primary, to: theme.other.brand.secondary, deg: 135 }}
            size="sm"
          >
            Selected
          </Badge>
        )}
      </Group>

      <Text 
        size="lg" 
        fw={theme.other.typography.fontWeight.semibold} 
        c={theme.other.text.primary}
        mb="xs"
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {deployment.name}
      </Text>

      <Group gap="xs" mb="sm">
        <IconUser size={theme.other.sizes.icon.sm} color={theme.other.text.tertiary} />
        <Text size="xs" c="dimmed">
          Created by {deployment.createdBy}
        </Text>
      </Group>

      <Divider mb="sm" />

      <Group justify="space-between" align="center" wrap="nowrap">
        <Text 
          size="xs" 
          c="dimmed"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {deployment.deploymentKey.substring(0, 16)}...
        </Text>

        <Group gap="xs" wrap="nowrap">
          <CopyButton value={deployment.deploymentKey} timeout={2000}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? "Copied!" : "Copy Key"} withArrow position="top">
                <ActionIcon
                  color={copied ? "teal" : "gray"}
                  variant="light"
                  onClick={(e) => {
                    e.stopPropagation();
                    copy();
                  }}
                  size="sm"
                >
                  {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
          <Tooltip label="Delete Deployment" withArrow position="top">
            <ActionIcon
              color="red"
              variant="light"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              size="sm"
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Card>
  );
};

export const DeploymentList = () => {
  const theme = useMantineTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const params = useParams();
  const { data, isLoading } = useGetDeploymentsForApp();

  const selectedDeployment = searchParams.get("deployment");

  const details = data?.find(
    (item) => item.name === selectedDeployment
  );

  const deploymentOptions = useMemo(() => {
    return data?.map(deployment => ({
      value: deployment.name,
      label: deployment.name,
    })) ?? [];
  }, [data]);

  const handleDeploymentChange = (value: string | null) => {
    if (value) {
      setSearchParams((prev) => {
        prev.set("deployment", value);
        return prev;
      });
    }
  };

  const handleDelete = (deploymentName: string) => {
    navigate(`/dashboard/delete?type=deployment&name=${encodeURIComponent(deploymentName)}&id=${encodeURIComponent(deploymentName)}&appId=${encodeURIComponent(params.app ?? "")}&tenant=${encodeURIComponent(params.org ?? "")}`);
  };

  useEffect(() => {
    if (!searchParams.get("deployment") && data && data.length > 0) {
      setSearchParams((p) => {
        p.set("deployment", data[0].name);
        return p;
      });
    }
  }, [data, searchParams, setSearchParams]);

  if (isLoading) {
    return (
      <Stack gap="xl">
        <Skeleton h={60} />
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} height={180} radius="md" />
          ))}
        </SimpleGrid>
      </Stack>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card
        withBorder
        radius="md"
        padding="xl"
        style={{ 
          textAlign: "center",
          backgroundColor: theme.other.backgrounds.secondary,
        }}
      >
        <IconKey size={48} color={theme.other.text.disabled} style={{ margin: "0 auto 16px" }} />
        <Text size="lg" fw={theme.other.typography.fontWeight.semibold} mb="xs">
          No Deployment Keys
        </Text>
        <Text c="dimmed">
          Create your first deployment key to start managing releases!
        </Text>
      </Card>
    );
  }

  return (
    <>
      <Stack gap="xl">
        <Box>
          <Group justify="space-between" align="flex-end" mb="md">
            <Box>
              <Title order={4} mb="xs">
                Deployment Keys
              </Title>
              <Text size="sm" c="dimmed">
                Select a deployment to view and manage its releases
              </Text>
            </Box>
            <Select
              placeholder="Filter by deployment..."
              data={deploymentOptions}
              value={selectedDeployment}
              onChange={handleDeploymentChange}
              searchable
              clearable
              leftSection={<IconKey style={{ width: rem(16), height: rem(16) }} />}
              style={{ minWidth: 250 }}
              styles={{
                input: {
                  borderColor: theme.other.borders.primary,
                  "&:focus": {
                    borderColor: theme.other.brand.primary,
                  },
                },
              }}
            />
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {data.map((deployment) => (
              <DeploymentCard
                key={deployment.id}
                deployment={deployment}
                isSelected={deployment.name === selectedDeployment}
                onClick={() => handleDeploymentChange(deployment.name)}
                onDelete={() => handleDelete(deployment.name)}
              />
            ))}
          </SimpleGrid>
        </Box>

        {details && (
          <Box>
            <Divider mb="lg" />
            <Title order={4} mb="md">
              Releases for {details.name}
            </Title>
            <ReleaseListForDeploymentTable />
          </Box>
        )}
      </Stack>

      <ReleaseDeatilCardModal
        id={searchParams.get("releaseId")}
        opened={!!searchParams.get("releaseId")}
        close={() => {
          navigate(-1);
        }}
        deploymentName={details?.name}
      />
    </>
  );
};
