import {
  Title,
  Text,
  Paper,
  Group,
  Skeleton,
  Box,
  Button,
  Flex,
} from "@mantine/core";
import { IconPlus, IconChevronRight } from "@tabler/icons-react";
import { useNavigate, useParams } from "@remix-run/react";
import { route } from "routes-gen";
import { User } from "~/.server/services/Auth/Auth.interface";
import { useGetAppListForOrg } from "../AppList/hooks/useGetAppListForOrg";
import { AppListRow } from "./components/AppListRow";
import { useGetOrgList } from "../OrgListNavbar/hooks/useGetOrgList";
import { text } from "~/theme";

type AppListPageProps = {
  user: User;
};

export function AppListPage({ user }: AppListPageProps) {
  const params = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetAppListForOrg({
    orgId: params.org ?? "",
    userEmail: user.user.email,
  });

  const { data: orgs = [] } = useGetOrgList();
  const currentOrg = orgs.find((org) => org.id === params.org);

  if (isLoading) {
    return (
      <Box>
        <Group justify="space-between" align="center" mb="xl">
          <Skeleton height={40} width={250} />
          <Skeleton height={40} width={200} />
        </Group>
        <Flex gap="lg" wrap="wrap">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <Skeleton key={index} width={250} height={250} radius="md" />
            ))}
        </Flex>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box>
        <Group justify="space-between" align="center" mb="xl">
          <Group gap="xs" align="center">
            <Title order={4} style={{ color: text.secondary }} fw={500}>
              {currentOrg?.orgName || "Organization"}
            </Title>
            <IconChevronRight size={18} color={text.secondary} />
            <Title order={4} style={{ color: text.secondary }} fw={500}>
              Applications
            </Title>
          </Group>
        </Group>
        <Text c="red" ta="center" p="xl">
          Something went wrong while loading apps!
        </Text>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box>
        <Group justify="space-between" align="center" mb="xl">
          <Group gap="xs" align="center">
            <Title order={4} style={{ color: text.secondary }} fw={500}>
              {currentOrg?.orgName || "Organization"}
            </Title>
            <IconChevronRight size={18} color={text.secondary} />
            <Title order={4} style={{ color: text.secondary }} fw={500}>
              Applications
            </Title>
          </Group>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => navigate(route("/dashboard/create/app"))}
            variant="gradient"
            gradient={{ from: "#6366f1", to: "#8b5cf6", deg: 135 }}
            styles={{
              root: {
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                transition: "all 200ms ease",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(99, 102, 241, 0.4)",
                  transform: "translateY(-1px)",
                },
              },
            }}
          >
            Create App
          </Button>
        </Group>
        <Paper withBorder p="xl" radius="md">
          <Text c="dimmed" ta="center">
            No apps found. Create your first app to get started!
          </Text>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Group justify="space-between" align="center" mb="xl">
        <Group gap="xs" align="center">
          <Title order={4} style={{ color: text.secondary }} fw={500}>
            {currentOrg?.orgName || "Organization"}
          </Title>
          <IconChevronRight size={18} color={text.secondary} />
          <Title order={4} style={{ color: text.secondary }} fw={500}>
            Applications
          </Title>
        </Group>
        <Button
          leftSection={<IconPlus size={18} />}
          onClick={() => navigate(route("/dashboard/create/app"))}
          variant="gradient"
          gradient={{ from: "#6366f1", to: "#8b5cf6", deg: 135 }}
          styles={{
            root: {
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
              transition: "all 200ms ease",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(99, 102, 241, 0.4)",
                transform: "translateY(-1px)",
              },
            },
          }}
        >
          Create App
        </Button>
      </Group>

      <Flex gap="lg" wrap="wrap">
        {data.map((app) => (
          <AppListRow
            key={app.id}
            app={app}
            onNavigate={() => {
              navigate(
                route("/dashboard/:org/:app", {
                  org: params.org ?? "",
                  app: app.id,
                })
              );
            }}
            onDelete={() => {
              navigate(
                route("/dashboard/delete") +
                  `?type=app&app=${app.id}&tenant=${params.org}`
              );
            }}
          />
        ))}
      </Flex>
    </Box>
  );
}

