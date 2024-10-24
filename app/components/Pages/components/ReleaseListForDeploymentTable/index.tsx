import cx from "clsx";
import { useEffect, useState } from "react";
import { Table, ScrollArea, Text } from "@mantine/core";
import classes from "./index.module.css";
import { useGetReleaseListForDeployment } from "./hooks/useGetReleaseListForDeployment";
import { useSearchParams } from "@remix-run/react";
import { ReleaseListResponse } from "./data/getReleaseListForDeployment";
type RowsProps = {
  isLoading: boolean;
  isError: boolean;
  data?: ReleaseListResponse[];
};

export const Rows = ({ isLoading, isError, data }: RowsProps) => {
  if (isLoading) {
    return (
      <Table.Tr>
        <Table.Td colSpan={8}>
          <Text>Loading</Text>
        </Table.Td>
      </Table.Tr>
    );
  }

  if (isError) {
    return (
      <Table.Tr>
        <Table.Td colSpan={8}>
          <Text>Something went Wrong!</Text>
        </Table.Td>
      </Table.Tr>
    );
  }

  if (!data?.length) {
    return (
      <Table.Tr>
        <Table.Td colSpan={8}>
          <Text>No Data Found</Text>
        </Table.Td>
      </Table.Tr>
    );
  }

  return (
    <>
      {data.map((row) => (
        <Table.Tr key={row.label}>
          <Table.Td>{row.label}</Table.Td>
          <Table.Td>{row.targetVersions}</Table.Td>
          <Table.Td>{row.status ? "Active" : "Inactive"}</Table.Td>
          <Table.Td>{row.mandatory ? "Yes" : "No"}</Table.Td>
          <Table.Td>{row.rollbacks}</Table.Td>
          <Table.Td>{row.activeDevices}</Table.Td>
          <Table.Td>{row.rollout}%</Table.Td>
          <Table.Td>{new Date(row.releasedAt).toLocaleDateString()}</Table.Td>
        </Table.Tr>
      ))}
    </>
  );
};

export function ReleaseListForDeploymentTable() {
  const { data, isLoading, refetch, isFetching, isError } =
    useGetReleaseListForDeployment("");
  const [searchParams] = useSearchParams();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    console.log("helloooo");
    refetch();
  }, [searchParams.get("deployment")]);

  return (
    <ScrollArea
      h={"60%"}
      onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
    >
      <Table
        striped
        highlightOnHover
        withTableBorder
        stickyHeader
        mt={"xl"}
        fz={"lg"}
      >
        <Table.Thead
          className={cx(classes.header, { [classes.scrolled]: scrolled })}
        >
          <Table.Tr>
            <Table.Th>Label</Table.Th>
            <Table.Th>Target Versions</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Mandatory</Table.Th>
            <Table.Th>Rollbacks</Table.Th>
            <Table.Th>Active Devices</Table.Th>
            <Table.Th>Rollout</Table.Th>
            <Table.Th>Released At</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Rows
            isLoading={isLoading || isFetching}
            isError={isError}
            data={data}
          />
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
