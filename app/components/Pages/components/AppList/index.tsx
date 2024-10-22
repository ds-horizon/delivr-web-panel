"use client";
import { Text, Skeleton, Grid, Center } from "@mantine/core";
import { useGetAppListForOrg } from "./hooks/useGetAppListForOrg";
import { useParams } from "@remix-run/react";
import { AppCard } from "~/components/AppCard";

export function AppListForOrg() {
  const params = useParams();
  const { data, isLoading, isError } = useGetAppListForOrg(params.org ?? "");

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
        {data.map((item) => {
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
