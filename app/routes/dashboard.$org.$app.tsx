import { rem, Tabs, Flex, Box, Skeleton, Button, Group, Title } from "@mantine/core";
import { IconPhoto, IconSettings, IconRocket } from "@tabler/icons-react";
import { CollabaratorList } from "~/components/Pages/components/CollaboratorList";
import { DeploymentList } from "~/components/Pages/DeploymentList";
import { CombinedSidebar } from "~/components/Pages/components/AppDetailPage/components/CombinedSidebar";
import { useGetOrgList } from "~/components/Pages/components/OrgListNavbar/hooks/useGetOrgList";
import { useLoaderData, useParams, useNavigate } from "@remix-run/react";
import { route } from "routes-gen";
import { User } from "~/.server/services/Auth/Auth.interface";
import { authenticateLoaderRequest } from "~/utils/authenticate";
import { useState } from "react";

export const loader = authenticateLoaderRequest();

export default function AppDetails() {
  const iconStyle = { width: rem(12), height: rem(12) };
  const user = useLoaderData<User>();
  const params = useParams();
  const navigate = useNavigate();
  const [showCollaborators, setShowCollaborators] = useState(false);

  const { data: orgs = [], isLoading: orgsLoading } = useGetOrgList();

  if (orgsLoading) {
    return (
      <Flex gap="xl">
        <Skeleton width={280} height="calc(100vh - 120px)" />
        <Box style={{ flex: 1 }}>
          <Skeleton height={40} width="100%" mb="md" />
          <Skeleton height={400} width="100%" />
        </Box>
      </Flex>
    );
  }

  return (
    <Flex gap="xl">
      <CombinedSidebar
        organizations={orgs}
        currentOrgId={params.org}
        currentAppId={params.app}
        userEmail={user.user.email}
        onCollaboratorsClick={() => setShowCollaborators(!showCollaborators)}
        showCollaborators={showCollaborators}
      />
      <Box style={{ flex: 1 }}>
        {showCollaborators ? (
          <>
            <Group justify="space-between" mb="xl">
              <Title order={2}>Collaborators</Title>
            </Group>
            <CollabaratorList />
          </>
        ) : (
          <>
            <Group justify="space-between" mb="md">
              <Title order={2}>Releases</Title>
              <Button
                leftSection={<IconRocket size={18} />}
                onClick={() => {
                  navigate(`/dashboard/${params.org}/${params.app}/create-release`);
                }}
                variant="gradient"
                gradient={{ from: "#667eea", to: "#764ba2", deg: 135 }}
              >
                Create Release
              </Button>
            </Group>
            <DeploymentList />
          </>
        )}
      </Box>
    </Flex>
  );
}
