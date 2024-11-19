import {
  Card,
  Text,
  Group,
  Badge,
  Center,
  Button,
  Tooltip,
  Flex,
  Avatar,
  Skeleton,
  Progress,
} from "@mantine/core";
import {
  Icon,
  IconDeviceTablet,
  IconFocus2,
  IconRotate2,
} from "@tabler/icons-react";
import classes from "./index.module.css";
import { ReleaseListResponse } from "../ReleaseListForDeploymentTable/data/getReleaseListForDeployment";
import { useGetReleaseDataForDeployment } from "./hooks/useGetReleaseDataForDeployment";
import { formatDate } from "~/utils/formatDate";
import { ReleaseEditFormModal } from "../ReleaseEditForm";
import { useParams, useSearchParams } from "@remix-run/react";

type StatsObject = {
  icon: Icon;
  key: keyof ReleaseListResponse;
  label: string;
};

const stats: StatsObject[] = [
  { icon: IconDeviceTablet, key: "activeDevices", label: "Active Devices" },
  { icon: IconRotate2, key: "rollbacks", label: "Rollbacks" },
  { icon: IconFocus2, key: "targetVersions", label: "Target Versions" },
];

export type ReleaseDataCardProps = {
  id: string;
  onEditClick: () => void;
};

export function ReleaseDetailCard({ id, onEditClick }: ReleaseDataCardProps) {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { data, isError, isLoading, isFetching, refetch } =
    useGetReleaseDataForDeployment({
      label: id,
      deploymentName: searchParams.get("deployment") ?? "",
      appId: params.app ?? "",
    });

  if (isLoading || isFetching) {
    return <Skeleton h={"100%"} w={"100%"} mih={400} />;
  }

  if (isError) {
    return <Text>Something Went Wrong</Text>;
  }

  if (!data) {
    return <Text>No Data Found</Text>;
  }

  const features = stats.map((feature) => (
    <Center key={feature.key}>
      <feature.icon size="1.05rem" className={classes.icon} stroke={1.5} />
      <Tooltip label={feature.label} color="blue" withArrow>
        <Text size="xs" style={{ cursor: "pointer" }}>
          {data[feature.key]}
        </Text>
      </Tooltip>
    </Center>
  ));

  return (
    <Card withBorder radius="md" className={classes.card} data-autofocus>
      <Group justify="space-between" mt="md">
        <div>
          <Text fw={500}>{data.label}</Text>
          <Text fz="xs" c="dimmed">
            {data.description}
          </Text>
        </div>
        <Badge variant="outline" color={data.status ? "green" : "gray"}>
          {data.status ? "Enabled" : "Disabled"}
        </Badge>
      </Group>

      <Card.Section className={classes.section} mt="md">
        <Text fz="sm" c="dimmed" className={classes.label}>
          Statistics
        </Text>

        <Group gap={8} mb={-8}>
          {features}
        </Group>
      </Card.Section>

      <Card.Section className={classes.section} mt="md">
        <Text fz="sm" c="dimmed" className={classes.label}>
          Rollout
        </Text>
        <Tooltip label={data.rollout} withArrow color="blue">
          <Progress.Root size="xl">
            <Progress.Section value={data.rollout} />
          </Progress.Root>
        </Tooltip>
      </Card.Section>

      <Card.Section className={classes.section}>
        <Flex justify={"space-between"}>
          <Flex align={"center"} style={{ cursor: "pointer" }}>
            <Tooltip withArrow label={data.releasedBy} color="blue">
              <Avatar
                key={data.releasedBy}
                name={data.releasedBy}
                color="initials"
              />
            </Tooltip>
            <Tooltip withArrow label={"Update Released Date"} color="blue">
              <Text
                fz="sm"
                c="dimmed"
                fw={500}
                style={{ lineHeight: 1 }}
                ml={3}
              >
                {formatDate(data.releasedAt)}
              </Text>
            </Tooltip>
          </Flex>

          <Button radius="xl" onClick={onEditClick}>
            Edit
          </Button>
        </Flex>
      </Card.Section>
      <ReleaseEditFormModal data={data} refetch={refetch} />
    </Card>
  );
}
