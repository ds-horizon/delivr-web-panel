"use client";
import { Text, Skeleton } from "@mantine/core";
import { useGetOrgList } from "./hooks/useGetOrgList";
import { LinksGroup, LinksGroupProps } from "~/components/NavbarLinksGroup";
import { useMemo } from "react";
import { IconGauge } from "@tabler/icons-react";

export function OrgListWithActions() {
  const { data, isLoading, isError } = useGetOrgList();

  const parsedData: (LinksGroupProps & { id: string })[] = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.map((org) => {
      return {
        icon: IconGauge,
        label: org.orgName,
        id: org.id,
        initiallyOpened: false,
        links: [
          {
            label: "Apps",
            link: `/dashboard/${org.id}/apps`,
          },
          {
            label: "Manage",
            link: `/dashboard/${org.id}/manage`,
          },
        ].filter((_item) => (org.isAdmin ? true : _item.label !== "Manage")),
      };
    });
  }, [data]);

  if (isLoading) {
    return (
      <>
        {Array(10)
          .fill("s")
          .map((_, index) => (
            <Skeleton key={index} width={"100%"} height={30} my={"md"} />
          ))}
      </>
    );
  }

  if (isError) {
    return <Text>Something Went Wrong!</Text>;
  }

  if (!data?.length) {
    return <Text>No Org Present</Text>;
  }

  return (
    <>
      {parsedData.map((item) => {
        return <LinksGroup {...item} key={`org-${item.id}`} />;
      })}
    </>
  );
}
