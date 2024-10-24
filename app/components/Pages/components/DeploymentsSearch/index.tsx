import { useGetDeploymentsForApp } from "./hooks/getDeploymentsForApp";
import {
  createSpotlight,
  Spotlight,
  SpotlightActionData,
} from "@mantine/spotlight";
import { IconDashboard, IconSearch } from "@tabler/icons-react";
import { Button, rem } from "@mantine/core";
import { useSearchParams } from "@remix-run/react";

const [deploymentSearch, deploymentSearchActions] = createSpotlight();

export const DeploymentsSearch = () => {
  const [_, setSearchParams] = useSearchParams();
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
    <>
      <Button onClick={deploymentSearchActions.open}>
        Search For Deployments
      </Button>
      <Spotlight
        store={deploymentSearch}
        actions={items}
        nothingFound="Nothing found..."
        highlightQuery
        scrollable
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
    </>
  );
};
