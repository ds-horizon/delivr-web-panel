"use client";
import { Text, Skeleton, Grid, Center } from "@mantine/core";
import { useGetAppListForOrg } from "./hooks/useGetAppListForOrg";
import { useParams } from "@remix-run/react";
import { AppCard } from "~/components/AppCard";
import { route } from "routes-gen";

export function AppListForOrg() {
  const params = useParams();
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

  return (
    <Center>
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
