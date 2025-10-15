import {
  Title,
  Text,
  Skeleton,
  Box,
  Container,
  SimpleGrid,
  Stack,
  Center,
  useMantineTheme,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useNavigate } from "@remix-run/react";
import { route } from "routes-gen";
import { useGetOrgList } from "../OrgListNavbar/hooks/useGetOrgList";
import { OrgCard } from "./components/OrgCard";
import { Intro } from "../../Intro";
import { CTAButton } from "~/components/CTAButton";

export function OrgsPage() {
  const theme = useMantineTheme();
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
          <Box style={{ textAlign: "center", width: "100%", marginTop: theme.other.spacing["4xl"] }}>
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
        <Box style={{ textAlign: "center", marginTop: theme.other.spacing["4xl"], marginBottom: theme.other.spacing.xl }}>
          <Title 
            order={1} 
            size="h1"
            fw={theme.other.typography.fontWeight.bold}
            mb="md"
            style={{
              background: theme.other.brand.gradient,
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
          <CTAButton
            size="md"
            leftSection={<IconPlus size={theme.other.sizes.icon.xl} />}
            onClick={() => navigate(route("/dashboard/create/org"))}
            styles={{
              root: {
                height: theme.other.sizes.button.lg,
                paddingLeft: theme.other.spacing["2xl"],
                paddingRight: theme.other.spacing["2xl"],
                fontSize: theme.other.typography.fontSize.base,
                boxShadow: theme.other.shadows.md,
              },
            }}
          >
            Create Organization
          </CTAButton>
        </Box>

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

