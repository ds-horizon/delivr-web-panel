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
import { OrgSwitcher } from "./components/OrgSwitcher";

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

  const { data: orgs = [], isLoading: orgsLoading } = useGetOrgList();
  const currentOrg = orgs.find((org) => org.id === params.org);

  if (isLoading || orgsLoading) {
    return (
      <Flex gap="xl">
        <Skeleton width={280} height="calc(100vh - 120px)" />
        <Box style={{ flex: 1 }}>
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
      </Flex>
    );
  }

  if (isError) {
    return (
      <Flex gap="xl">
        <OrgSwitcher organizations={orgs} currentOrgId={params.org} />
        <Box style={{ flex: 1 }}>
          <Group justify="space-between" align="center" mb="xl">
            <Group gap="xs">
              <Title order={2} c="gray.9" fw={600}>
                {currentOrg?.orgName || "Organization"}
              </Title>
              <IconChevronRight size={24} color="gray" />
              <Title order={2} c="gray.9" fw={600}>
                Applications
              </Title>
            </Group>
          </Group>
          <Text c="red" ta="center" p="xl">
            Something went wrong while loading apps!
          </Text>
        </Box>
      </Flex>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Flex gap="xl">
        <OrgSwitcher organizations={orgs} currentOrgId={params.org} />
        <Box style={{ flex: 1 }}>
          <Group justify="space-between" align="center" mb="xl">
            <Group gap="xs">
              <Title order={2} c="gray.9" fw={600}>
                {currentOrg?.orgName || "Organization"}
              </Title>
              <IconChevronRight size={24} color="gray" />
              <Title order={2} c="gray.9" fw={600}>
                Applications
              </Title>
            </Group>
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={() => navigate(route("/dashboard/create/app"))}
              variant="gradient"
              gradient={{ from: "#667eea", to: "#764ba2", deg: 135 }}
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
      </Flex>
    );
  }

  return (
    <Flex gap="xl">
      <OrgSwitcher organizations={orgs} currentOrgId={params.org} />
      <Box style={{ flex: 1 }}>
        <Group justify="space-between" align="center" mb="xl">
          <Group gap="xs">
            <Title order={2} c="gray.9" fw={600}>
              {currentOrg?.orgName || "Organization"}
            </Title>
            <IconChevronRight size={24} color="gray" />
            <Title order={2} c="gray.9" fw={600}>
              Applications
            </Title>
          </Group>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => navigate(route("/dashboard/create/app"))}
            variant="gradient"
            gradient={{ from: "#667eea", to: "#764ba2", deg: 135 }}
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
    </Flex>
  );
}

