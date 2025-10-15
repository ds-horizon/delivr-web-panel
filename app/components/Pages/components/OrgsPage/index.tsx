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
  Card,
  Badge,
} from "@mantine/core";
import { IconPlus, IconCode, IconRocket } from "@tabler/icons-react";
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
    <Container size="xl" py="md">
      <Stack gap="lg">
        <Box style={{ textAlign: "center", marginTop: theme.other.spacing.xl, marginBottom: theme.other.spacing.md }}>
          <Badge
            size="md"
            radius="sm"
            variant="light"
            mb="sm"
            style={{
              backgroundColor: theme.other.brand.light,
              color: theme.other.brand.primaryDark,
              fontSize: theme.other.typography.fontSize.xs,
              fontWeight: theme.other.typography.fontWeight.semibold,
              letterSpacing: theme.other.typography.letterSpacing.wide,
              textTransform: "uppercase",
            }}
          >
            OTA Air Updates
          </Badge>
          <Title 
            order={1} 
            fw={theme.other.typography.fontWeight.bold}
            mb="xs"
            c={theme.other.text.primary}
          >
            Your Organizations
          </Title>
          <Text size="md" c={theme.other.text.tertiary} mb="lg" maw={500} mx="auto">
            Manage over-the-air updates for your applications
          </Text>
          <CTAButton
            leftSection={<IconPlus size={theme.other.sizes.icon.lg} />}
            onClick={() => navigate(route("/dashboard/create/org"))}
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

        {/* Coming Soon Section */}
        <Box 
          style={{ 
            marginTop: theme.other.spacing["4xl"],
            padding: theme.other.spacing.xl,
            borderRadius: theme.other.borderRadius.lg,
            background: theme.other.backgrounds.secondary,
            border: `1px solid ${theme.other.borders.primary}`,
          }}
        >
          <Badge
            size="lg"
            radius="md"
            variant="gradient"
            gradient={{ from: theme.other.brand.primary, to: theme.other.brand.secondary, deg: 135 }}
            mb="md"
            style={{
              fontSize: theme.other.typography.fontSize.sm,
              fontWeight: theme.other.typography.fontWeight.bold,
              letterSpacing: theme.other.typography.letterSpacing.wide,
              textTransform: "uppercase",
              display: "block",
              margin: "0 auto",
              width: "fit-content",
            }}
          >
            Coming Soon
          </Badge>
          <Title 
            order={3} 
            fw={theme.other.typography.fontWeight.semibold}
            mb="xs"
            ta="center"
            c={theme.other.text.primary}
          >
            New Features In Development
          </Title>
          <Text size="sm" c={theme.other.text.tertiary} mb="lg" maw={600} mx="auto" ta="center">
            Advanced build automation and release orchestration coming soon
          </Text>

          <SimpleGrid 
            cols={{ base: 1, sm: 2 }} 
            spacing="lg"
            style={{ 
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            {/* Build Management Card */}
            <Card
              withBorder
              padding={0}
              radius="lg"
              style={{
                borderColor: theme.other.borders.brand,
                backgroundColor: theme.other.backgrounds.primary,
                overflow: "hidden",
                position: "relative",
                boxShadow: theme.other.shadows.md,
              }}
            >
              <Box
                style={{
                  background: `linear-gradient(135deg, ${theme.other.brand.primary}33 0%, ${theme.other.brand.secondary}33 100%)`,
                  padding: theme.other.spacing.lg,
                  height: "120px",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Badge
                  variant="filled"
                  size="sm"
                  radius="sm"
                  style={{
                    textTransform: "uppercase",
                    fontSize: theme.other.typography.fontSize.xs,
                    fontWeight: theme.other.typography.fontWeight.semibold,
                    letterSpacing: theme.other.typography.letterSpacing.wide,
                    backgroundColor: theme.other.brand.primary,
                    color: theme.other.text.white,
                  }}
                >
                  Coming Soon
                </Badge>
              </Box>

              <Box
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "-40px",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Box
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: theme.other.borderRadius.xl,
                    background: theme.other.backgrounds.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `4px solid ${theme.other.backgrounds.primary}`,
                    boxShadow: theme.other.shadows.lg,
                  }}
                >
                  <Box
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: theme.other.borderRadius.lg,
                      background: `${theme.other.brand.primary}22`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconCode 
                      size={theme.other.sizes.icon["3xl"]} 
                      color={theme.other.brand.primary}
                      stroke={1.5}
                    />
                  </Box>
                </Box>
              </Box>

              <Stack gap="xs" style={{ padding: theme.other.spacing.lg, paddingTop: theme.other.spacing.md }}>
                <Text
                  ta="center"
                  size="lg"
                  fw={theme.other.typography.fontWeight.semibold}
                  style={{
                    color: theme.other.text.primary,
                  }}
                >
                  Build Management
                </Text>

                <Text 
                  ta="center" 
                  size="sm" 
                  c="dimmed"
                  fw={theme.other.typography.fontWeight.medium}
                  style={{ minHeight: "60px" }}
                >
                  Automate your build pipeline with integrated CI/CD workflows and version control
                </Text>
              </Stack>
            </Card>

            {/* Release Management Card */}
            <Card
              withBorder
              padding={0}
              radius="lg"
              style={{
                borderColor: theme.other.borders.brand,
                backgroundColor: theme.other.backgrounds.primary,
                overflow: "hidden",
                position: "relative",
                boxShadow: theme.other.shadows.md,
              }}
            >
              <Box
                style={{
                  background: `linear-gradient(135deg, ${theme.other.brand.secondary}33 0%, ${theme.other.brand.tertiary}33 100%)`,
                  padding: theme.other.spacing.lg,
                  height: "120px",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Badge
                  variant="filled"
                  size="sm"
                  radius="sm"
                  style={{
                    textTransform: "uppercase",
                    fontSize: theme.other.typography.fontSize.xs,
                    fontWeight: theme.other.typography.fontWeight.semibold,
                    letterSpacing: theme.other.typography.letterSpacing.wide,
                    backgroundColor: theme.other.brand.secondary,
                    color: theme.other.text.white,
                  }}
                >
                  Coming Soon
                </Badge>
              </Box>

              <Box
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "-40px",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Box
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: theme.other.borderRadius.xl,
                    background: theme.other.backgrounds.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `4px solid ${theme.other.backgrounds.primary}`,
                    boxShadow: theme.other.shadows.lg,
                  }}
                >
                  <Box
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: theme.other.borderRadius.lg,
                      background: `${theme.other.brand.secondary}22`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconRocket 
                      size={theme.other.sizes.icon["3xl"]} 
                      color={theme.other.brand.secondary}
                      stroke={1.5}
                    />
                  </Box>
                </Box>
              </Box>

              <Stack gap="xs" style={{ padding: theme.other.spacing.lg, paddingTop: theme.other.spacing.md }}>
                <Text
                  ta="center"
                  size="lg"
                  fw={theme.other.typography.fontWeight.semibold}
                  style={{
                    color: theme.other.text.primary,
                  }}
                >
                  Release Management
                </Text>

                <Text 
                  ta="center" 
                  size="sm" 
                  c="dimmed"
                  fw={theme.other.typography.fontWeight.medium}
                  style={{ minHeight: "60px" }}
                >
                  Advanced release orchestration with staged rollouts and automated approvals
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>
        </Box>
      </Stack>
    </Container>
  );
}

