import {
  Title,
  Button,
  Text,
  Skeleton,
  Box,
  Container,
  SimpleGrid,
  Stack,
  Center,
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
      <Container size="xl">
        <Stack gap="xl" align="center">
          <Box style={{ textAlign: "center", width: "100%", marginTop: "40px" }}>
            <Skeleton height={48} width={300} mx="auto" mb="md" />
            <Skeleton height={24} width={500} mx="auto" mb="lg" />
            <Skeleton height={44} width={220} mx="auto" />
          </Box>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="xl" style={{ width: "100%" }}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <Skeleton key={index} height={280} radius="md" />
              ))}
          </SimpleGrid>
        </Stack>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container size="xl">
        <Center style={{ minHeight: "400px" }}>
          <Stack gap="md" align="center">
            <Title order={2} c="gray.7">
              Organizations
            </Title>
            <Text c="red" size="lg">
              Something went wrong while loading organizations!
            </Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Hero Section */}
        <Box style={{ textAlign: "center", marginTop: "40px", marginBottom: "20px" }}>
          <Title 
            order={1} 
            size="h1"
            fw={700}
            mb="md"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Your Organizations
          </Title>
          <Text size="lg" c="dimmed" mb="xl" maw={600} mx="auto">
            Select an organization to view its applications and manage deployments
          </Text>
          <Button
            size="md"
            leftSection={<IconPlus size={20} />}
            onClick={() => navigate(route("/dashboard/create/org"))}
            variant="gradient"
            gradient={{ from: "#6366f1", to: "#8b5cf6", deg: 135 }}
            styles={{
              root: {
                height: "44px",
                paddingLeft: "24px",
                paddingRight: "24px",
                fontSize: "16px",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                transition: "all 200ms ease",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(99, 102, 241, 0.4)",
                  transform: "translateY(-2px)",
                },
              },
            }}
          >
            Create Organization
          </Button>
        </Box>

        {/* Organizations Grid - Center Aligned */}
        <Box>
          <SimpleGrid 
            cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} 
            spacing="xl"
            style={{ 
              maxWidth: "1400px",
              margin: "0 auto",
            }}
          >
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
          </SimpleGrid>
        </Box>
      </Stack>
    </Container>
  );
}

