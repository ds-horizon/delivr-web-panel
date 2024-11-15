"use client";
import { Text, Skeleton, Grid, Center, rem } from "@mantine/core";
import { useGetAppListForOrg } from "./hooks/useGetAppListForOrg";
import { useNavigate, useParams } from "@remix-run/react";
import { AppCard } from "~/components/AppCard";
import { route } from "routes-gen";
import { Spotlight, SpotlightActionData } from "@mantine/spotlight";
import { IconApps, IconSearch } from "@tabler/icons-react";

export function AppListForOrg() {
  const params = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetAppListForOrg(params.org ?? "");

  const _modData =
    data?.map((item) => ({
      ...item,
      link: route("/dashboard/:org/:app", {
        org: params.org ?? "",
        app: item.id,
      }),
    })) ?? [];

  if (isLoading) {
    return (
      <Center>
        <Grid justify="center">
          {Array(12)
            .fill("s")
            .map((_, index) => (
              <Grid.Col key={index} span="content">
                <Skeleton key={index} width={300} height={400} my={"md"} />
              </Grid.Col>
            ))}
        </Grid>
      </Center>
    );
  }

  if (isError) {
    return <Text>Something Went Wrong!</Text>;
  }

  if (!data?.length) {
    return <Text>No Apps yet</Text>;
  }

  const actions: SpotlightActionData[] = _modData.map((item) => {
    return {
      id: item.id,
      label: item.name,
      description: "",
      onClick: () => {
        navigate(item.link);
      },
      leftSection: (
        <IconApps style={{ width: rem(24), height: rem(24) }} stroke={1.5} />
      ),
    };
  });

  return (
    <Center>
      <Spotlight
        actions={actions}
        nothingFound="Nothing found..."
        highlightQuery
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
      <Grid justify="center">
        {_modData.map((item) => {
          return (
            <Grid.Col key={item.id} span="content">
              <AppCard {...item} key={item.id} />
            </Grid.Col>
          );
        })}
      </Grid>
    </Center>
  );
}
