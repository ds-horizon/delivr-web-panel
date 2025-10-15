import { Box, Button, Group, Tabs, rem } from "@mantine/core";
import { IconRocket, IconKey, IconUsers, IconList } from "@tabler/icons-react";
import { CollabaratorList } from "~/components/Pages/components/CollaboratorList";
import { DeploymentList } from "~/components/Pages/DeploymentList";
import { useLoaderData, useParams, useNavigate } from "@remix-run/react";
import { User } from "~/.server/services/Auth/Auth.interface";
import { authenticateLoaderRequest } from "~/utils/authenticate";
import { useState } from "react";
import { CreateDeploymentForm } from "~/components/Pages/components/CreateDeploymentForm";
import { useGetDeploymentsForApp } from "~/components/Pages/DeploymentList/hooks/getDeploymentsForApp";

export const loader = authenticateLoaderRequest();

export default function AppDetails() {
  const _user = useLoaderData<User>();
  const params = useParams();
  const navigate = useNavigate();
  const [createDeploymentOpen, setCreateDeploymentOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>("deployments");

  const { refetch: refetchDeployments } = useGetDeploymentsForApp();

  const iconStyle = { width: rem(16), height: rem(16) };

  return (
    <Box>
      <Group justify="space-between" mb="md">
        <Tabs 
          value={activeTab} 
          onChange={setActiveTab}
          color="indigo"
        >
          <Tabs.List>
            <Tabs.Tab value="deployments" leftSection={<IconList style={iconStyle} />}>
              Releases
            </Tabs.Tab>
            <Tabs.Tab value="collaborators" leftSection={<IconUsers style={iconStyle} />}>
              Collaborators
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
        
        {activeTab === "deployments" && (
          <Group gap="sm">
            <Button
              leftSection={<IconKey size={18} />}
              onClick={() => setCreateDeploymentOpen(true)}
              variant="default"
              styles={{
                root: {
                  borderColor: "#e5e7eb",
                  "&:hover": {
                    background: "#f9fafb",
                    borderColor: "#6366f1",
                  },
                },
              }}
            >
              Create Deployment Key
            </Button>
            <Button
              leftSection={<IconRocket size={18} />}
              onClick={() => {
                navigate(`/dashboard/${params.org}/${params.app}/create-release`);
              }}
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
              Create Release
            </Button>
          </Group>
        )}
      </Group>

      {activeTab === "deployments" && <DeploymentList />}
      {activeTab === "collaborators" && <CollabaratorList />}

      {/* Create Deployment Modal */}
      <CreateDeploymentForm
        open={createDeploymentOpen}
        onClose={() => {
          setCreateDeploymentOpen(false);
          refetchDeployments();
        }}
      />
    </Box>
  );
}
