import { useState } from "react";

import { useGetDeploymentsForApp } from "./hooks/getDeploymentsForApp";
import { spotlight, Spotlight } from "@mantine/spotlight";
import { IconRocket, IconSearch } from "@tabler/icons-react";
import { Box, Button, Group, ScrollArea, Text } from "@mantine/core";
import { useSearchParams } from "@remix-run/react";

export const DeploymentsSearch = () => {
  const [query, setQuery] = useState("");
  const [_, setSearchParams] = useSearchParams();
  const { data } = useGetDeploymentsForApp();

  const items =
    data
      ?.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase().trim())
      )
      .map((item) => (
        <Group wrap="nowrap" w="100%" key={item.id}>
          <Spotlight.Action
            key={item.id}
            onClick={() => {
              setSearchParams((prev) => {
                prev.set("deployment", item.name);
                return prev;
              });
            }}
          >
            <Box p={15} display={"flex"}>
              <IconRocket stroke={1.5} />
              <Text>{item.name}</Text>
            </Box>
          </Spotlight.Action>
        </Group>
      )) ?? [];

  return (
    <>
      <Button onClick={spotlight.open}>Search For Deployments</Button>

      <Spotlight.Root query={query} onQueryChange={setQuery} scrollable>
        <Spotlight.Search
          placeholder="Search..."
          leftSection={<IconSearch stroke={1.5} />}
        />
        <Spotlight.ActionsList>
          <ScrollArea.Autosize mah={350}>
            {items.length > 0 ? (
              items
            ) : (
              <Spotlight.Empty>Nothing found...</Spotlight.Empty>
            )}
          </ScrollArea.Autosize>
        </Spotlight.ActionsList>
      </Spotlight.Root>
    </>
  );
};
