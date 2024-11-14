import { useGetDeploymentsForApp } from "./hooks/getDeploymentsForApp";
import {
  createSpotlight,
  Spotlight,
  SpotlightActionData,
} from "@mantine/spotlight";
import { IconDashboard, IconPlus, IconSearch } from "@tabler/icons-react";
import { ActionIcon, Box, Button, Kbd, rem, Text } from "@mantine/core";
import { useSearchParams } from "@remix-run/react";
import { CreateDeploymentForm } from "../CreateDeploymentForm";
import { useState } from "react";

const [deploymentSearch, deploymentSearchActions] = createSpotlight();

export const DeploymentsSearch = () => {
  const [_, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const { data } = useGetDeploymentsForApp();

  const items: SpotlightActionData[] =
    data?.map((item) => {
      return {
        id: item.id,
        label: item.name,
        description: item.deploymentKey,
        onClick: () => {
          setSearchParams((prev) => {
            prev.set("deployment", item.name);
            return prev;
          });
        },
        leftSection: (
          <IconDashboard
            style={{ width: rem(24), height: rem(24) }}
            stroke={1.5}
          />
        ),
      };
    }) ?? [];

  return (
    <Box>
      <Button
        variant="light"
        rightSection={
          <Box>
            <ActionIcon mr={"sm"} ml={"lg"}>
              <IconPlus
                style={{ width: rem(12), height: rem(12) }}
                onClick={() => setOpen(true)}
              />
            </ActionIcon>
            <ActionIcon>
              <IconSearch
                style={{ width: rem(12), height: rem(12) }}
                onClick={deploymentSearchActions.open}
              />
            </ActionIcon>
          </Box>
        }
      >
        Deployments
      </Button>
      <Spotlight
        store={deploymentSearch}
        actions={items}
        nothingFound="Nothing found..."
        highlightQuery
        scrollable={(data?.length ?? 0) > 5}
        shortcut={["mod + K"]}
        maxHeight={350}
        searchProps={{
          leftSection: (
            <IconSearch
              style={{ width: rem(20), height: rem(20) }}
              stroke={1.5}
            />
          ),
          placeholder: "Search...",
        }}
      />
      <CreateDeploymentForm open={open} onClose={() => setOpen(false)} />
    </Box>
  );
};
