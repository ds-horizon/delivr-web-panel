import { Card, Avatar, Text, Group, Button, Flex } from "@mantine/core";
import classes from "./index.module.css";
import { useNavigate } from "@remix-run/react";
import { AppCardResponse } from "../Pages/components/AppList/data/getAppListForOrg";
import { IconTrash } from "@tabler/icons-react";

export type AppCardProps = AppCardResponse & {
  link: string;
  deleteLink: string;
};

type StatsObject = {
  label: string;
  key: keyof AppCardProps["metrics"];
};
const stats: StatsObject[] = [
  { label: "Deployments", key: "numberOfDeployments" },
  { label: "Releases", key: "numberOfReleases" },
];

export function AppCard({
  name,
  metrics,
  description,
  link,
  deleteLink,
}: AppCardProps) {
  const navigate = useNavigate();
  const items = stats.map((stat) => (
    <div key={stat.label}>
      <Text ta="center" fz="lg" fw={500}>
        {metrics[stat.key]}
      </Text>
      <Text ta="center" fz="sm" c="dimmed" lh={1}>
        {stat.label}
      </Text>
    </div>
  ));

  return (
    <Card withBorder padding="xl" radius="md" className={classes.card}>
      <Card.Section h={100} />
      <Avatar
        key={name}
        name={name}
        color="initials"
        size={80}
        radius={80}
        mx="auto"
        mt={-30}
        className={classes.avatar}
      />
      <Text ta="center" fz="lg" fw={500} mt="sm">
        {name}
      </Text>
      <Text ta="center" fz="sm" c="dimmed">
        {description}
      </Text>
      <Group mt="md" justify="center" gap={30}>
        {items}
      </Group>
      <Flex justify={"space-between"} align={"center"}>
        <Button
          fullWidth
          radius="md"
          mt="xl"
          size="md"
          onClick={() => {
            navigate(link);
          }}
        >
          Go To App
        </Button>
        <Button
          radius="md"
          mt="xl"
          mx={"sm"}
          size="md"
          onClick={() => {
            navigate(deleteLink);
          }}
          color="red"
          variant="light"
        >
          <IconTrash />
        </Button>
      </Flex>
    </Card>
  );
}
