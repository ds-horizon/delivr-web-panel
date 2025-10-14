import {
  ActionIcon,
  Card,
  CopyButton,
  Flex,
  rem,
  Skeleton,
  Text,
  Tooltip,
  TextInput,
  Group,
  ScrollArea,
} from "@mantine/core";
import { useNavigate, useSearchParams, useParams } from "@remix-run/react";
import { DeploymentsSearch } from "../components/DeploymentsSearch";
import { useGetDeploymentsForApp } from "./hooks/getDeploymentsForApp";
import { IconCheck, IconCopy, IconSearch, IconTrash } from "@tabler/icons-react";
import { ReleaseListForDeploymentTable } from "../components/ReleaseListForDeploymentTable";
import { ReleaseDeatilCardModal } from "../components/ReleaseDetailCardModal";
import { useDeleteDeployment } from "../components/DeploymentsSearch/hooks/useDeleteDeployment";
import { useEffect, useState, useRef } from "react";

export const DeploymentList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const params = useParams();
  const { data, isLoading, refetch } = useGetDeploymentsForApp();
  const { mutate: deleteDeployment } = useDeleteDeployment();
  
  // Local state for the new UI
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const details = data?.find(
    (item) => item.name === searchParams.get("deployment")
  );

  // Filter deployments based on search query
  const filteredDeployments = data?.filter(deployment => 
    deployment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deployment.deploymentKey.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  // Show all deployments when focused and no search query, or filtered results when searching
  const displayDeployments = searchFocused && !searchQuery ? data ?? [] : filteredDeployments;
  const shouldShowResults = searchFocused && displayDeployments.length > 0;

  // Handlers
  const handleSearchSelect = (deploymentName: string) => {
    setSearchParams((prev) => {
      prev.set("deployment", deploymentName);
      return prev;
    });
    setSearchQuery(""); // Clear search after selection
    setSearchFocused(false); // Close dropdown after selection
  };

  const handleDelete = () => {
    const currentDeployment = searchParams.get("deployment");
    if (currentDeployment) {
      // Use the existing modal pattern like organization deletion
      navigate(`/dashboard/delete?type=deployment&name=${encodeURIComponent(currentDeployment)}&id=${encodeURIComponent(currentDeployment)}&appId=${encodeURIComponent(params.app ?? "")}&tenant=${encodeURIComponent(params.org ?? "")}`);
    }
  };

  useEffect(() => {
    if (!searchParams.get("deployment")) {
      if (data) {
        setSearchParams((p) => {
          p.set("deployment", data?.[0]?.name ?? "Production");
          return p;
        });
      }
    }
  }, [data]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* New improved layout */}
      <Flex direction="column" gap="md">
        {/* Search Bar */}
        <div ref={searchContainerRef} style={{ position: 'relative' }}>
          <TextInput
            placeholder="Search deployments by name or key..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            onFocus={() => setSearchFocused(true)}
            leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} />}
            style={{ maxWidth: 400 }}
          />

          {/* Search Results Dropdown */}
          {shouldShowResults && (
            <Card 
              withBorder 
              radius="md" 
              padding="xs"
              style={{ 
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1000,
                maxWidth: 400,
                marginTop: '4px'
              }}
            >
              <Text size="sm" c="dimmed" mb="xs">
                {searchQuery ? `Search Results (${displayDeployments.length})` : `All Deployments (${displayDeployments.length})`}
              </Text>
              <ScrollArea h={Math.min(displayDeployments.length * 60, 300)} offsetScrollbars>
                {displayDeployments.map((deployment) => (
                  <Group
                    key={deployment.id}
                    justify="space-between"
                    p="xs"
                    style={{ 
                      cursor: 'pointer',
                      borderRadius: '4px',
                      minHeight: '56px'
                    }}
                    onClick={() => handleSearchSelect(deployment.name)}
                    __vars={{
                      '--group-hover-bg': 'var(--mantine-color-gray-0)'
                    }}
                    data-hover
                  >
                    <div>
                      <Text size="sm" fw={500}>{deployment.name}</Text>
                      <Text size="xs" c="dimmed" truncate style={{ maxWidth: '280px' }}>
                        {deployment.deploymentKey}
                      </Text>
                    </div>
                  </Group>
                ))}
              </ScrollArea>
              {displayDeployments.length === 0 && searchQuery && (
                <Text size="sm" c="dimmed" ta="center" py="md">
                  No deployments found matching "{searchQuery}"
                </Text>
              )}
            </Card>
          )}
        </div>

        {/* Selected Deployment Card */}
        {details && !isLoading ? (
          <Card
            withBorder
            radius="md"
            padding="sm"
            bg="var(--mantine-color-body)"
          >
            <Flex align={"center"} justify="space-between">
              <div>
                <Text fz="md" tt="uppercase" fw={700}>
                  {details?.name}
                </Text>
                <Text size="xs" c="dimmed">Selected Deployment</Text>
              </div>
              <Group gap="xs">
                <CopyButton value={details.deploymentKey} timeout={2000}>
                  {({ copied, copy }) => (
                    <Tooltip
                      label={
                        copied
                          ? "Copied"
                          : `Copy Deployment Key (${details.deploymentKey})`
                      }
                      withArrow
                      position="left"
                      color={copied ? "teal" : "blue"}
                    >
                      <ActionIcon
                        color={copied ? "teal" : "gray"}
                        variant="subtle"
                        onClick={copy}
                        size="lg"
                      >
                        {copied ? (
                          <IconCheck style={{ width: rem(18) }} />
                        ) : (
                          <IconCopy style={{ width: rem(18) }} />
                        )}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
                <Tooltip
                  label={`Delete ${details.name} deployment`}
                  withArrow
                  position="left"
                  color="red"
                >
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={handleDelete}
                    size="lg"
                  >
                    <IconTrash style={{ width: rem(18) }} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Flex>
          </Card>
        ) : isLoading ? (
          <Skeleton h={80} />
        ) : data?.length ? (
          <Text ta="center" c="dimmed">Use the search above to find and select a deployment</Text>
        ) : (
          <Text ta="center" c="dimmed">No deployments found. Create your first deployment!</Text>
        )}
      </Flex>

      <ReleaseListForDeploymentTable />
      
      {/* Modals */}
      <ReleaseDeatilCardModal
        id={searchParams.get("releaseId")}
        opened={!!searchParams.get("releaseId")}
        close={() => {
          navigate(-1);
        }}
        deploymentName={details?.name}
      />
    </>
  );
};
