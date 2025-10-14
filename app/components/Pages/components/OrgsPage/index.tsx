import {
  Title,
  Button,
  Text,
  Group,
  Skeleton,
  Box,
  Flex,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useNavigate } from "@remix-run/react";
import { route } from "routes-gen";
import { useGetOrgList } from "../OrgListNavbar/hooks/useGetOrgList";
import { OrgCard } from "./components/OrgCard";
import { Intro } from "../../Intro";

export function OrgsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetOrgList();

  // Show intro page if no organizations exist
  if (!isLoading && !isError && (!data || data.length === 0)) {
    return <Intro />;
  }

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
          <Title order={2} c="gray.9" fw={600}>
            Organizations
          </Title>
        </Group>
        <Text c="red" ta="center" p="xl">
          Something went wrong while loading organizations!
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Group justify="space-between" align="center" mb="xl">
        <Title order={2} c="gray.9" fw={600}>
          Organizations
        </Title>
        <Button
          leftSection={<IconPlus size={18} />}
          onClick={() => navigate(route("/dashboard/create/org"))}
          variant="gradient"
          gradient={{ from: "#667eea", to: "#764ba2", deg: 135 }}
        >
          Create Organization
        </Button>
      </Group>

      {/* Organizations Grid */}
      <Flex gap="lg" wrap="wrap">
        {data?.map((org) => (
          <OrgCard
            key={org.id}
            org={org}
            onNavigate={() => {
              navigate(
                route("/dashboard/:org/apps", {
                  org: org.id,
                })
              );
            }}
            onDelete={() => {
              navigate(
                route("/dashboard/delete") + `?type=org&id=${org.id}&name=${org.orgName}&tenant=${org.id}`
              );
            }}
          />
        ))}
      </Flex>
    </Box>
  );
}

