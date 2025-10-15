import {
  Title,
  Text,
  Paper,
  Group,
  Skeleton,
  Box,
  Flex,
  useMantineTheme,
} from "@mantine/core";
import { IconPlus, IconChevronRight } from "@tabler/icons-react";
import { useNavigate, useParams } from "@remix-run/react";
import { route } from "routes-gen";
import { User } from "~/.server/services/Auth/Auth.interface";
import { useGetAppListForOrg } from "../AppList/hooks/useGetAppListForOrg";
import { AppListRow } from "./components/AppListRow";
import { useGetOrgList } from "../OrgListNavbar/hooks/useGetOrgList";
import { CTAButton } from "~/components/CTAButton";

type AppListPageProps = {
  user: User;
};

export function AppListPage({ user }: AppListPageProps) {
  const theme = useMantineTheme();
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
        <Group justify="space-between" align="center" mb="lg">
          <Group gap="xs" align="center">
            <Text size="md" fw={theme.other.typography.fontWeight.semibold} c={theme.other.text.primary}>
              {currentOrg?.orgName || "Organization"}
            </Text>
            <IconChevronRight size={theme.other.sizes.icon.md} color={theme.other.text.tertiary} />
            <Text size="md" fw={theme.other.typography.fontWeight.semibold} c={theme.other.text.primary}>
              Applications
            </Text>
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
        <Group justify="space-between" align="center" mb="lg">
          <Group gap="xs" align="center">
            <Text size="md" fw={theme.other.typography.fontWeight.semibold} c={theme.other.text.primary}>
              {currentOrg?.orgName || "Organization"}
            </Text>
            <IconChevronRight size={theme.other.sizes.icon.md} color={theme.other.text.tertiary} />
            <Text size="md" fw={theme.other.typography.fontWeight.semibold} c={theme.other.text.primary}>
              Applications
            </Text>
          </Group>
          <CTAButton
            leftSection={<IconPlus size={theme.other.sizes.icon.lg} />}
            onClick={() => navigate(route("/dashboard/create/app"))}
            styles={{
              root: {
                boxShadow: theme.other.shadows.md,
              },
            }}
          >
            Create App
          </CTAButton>
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
      <Group justify="space-between" align="center" mb="lg">
        <Group gap="xs" align="center">
          <Text size="md" fw={theme.other.typography.fontWeight.semibold} c={theme.other.text.primary}>
            {currentOrg?.orgName || "Organization"}
          </Text>
          <IconChevronRight size={theme.other.sizes.icon.md} color={theme.other.text.tertiary} />
          <Text size="md" fw={theme.other.typography.fontWeight.semibold} c={theme.other.text.primary}>
            Applications
          </Text>
        </Group>
        <CTAButton
          leftSection={<IconPlus size={theme.other.sizes.icon.lg} />}
          onClick={() => navigate(route("/dashboard/create/app"))}
          styles={{
            root: {
              boxShadow: theme.other.shadows.md,
            },
          }}
        >
          Create App
        </CTAButton>
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

