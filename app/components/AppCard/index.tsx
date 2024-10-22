import { Card, Avatar, Text, Group, Button } from "@mantine/core";
import classes from "./index.module.css";
enum PLATFORM {
  "ANDROID" = "ANDROID",
  "IOS" = "IOS",
}

type AppCardProps = {
  id: string;
  name: string;
  link: string;
  description: string;
  platform: PLATFORM;
  metrics: {
    numberOfDeployments: number;
    numberOfReleases: number;
  };
};

type StatsObject = {
  label: string;
  key: keyof AppCardProps["metrics"];
};
const stats: StatsObject[] = [
  { label: "Deployments", key: "numberOfDeployments" },
  { label: "Releases", key: "numberOfReleases" },
];

export function AppCard({ name, metrics, description }: AppCardProps) {
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
      <Button fullWidth radius="md" mt="xl" size="md" variant="default">
        Go To App
      </Button>
    </Card>
  );
}
