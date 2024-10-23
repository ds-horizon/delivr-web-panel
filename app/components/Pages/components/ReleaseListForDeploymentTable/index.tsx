import cx from "clsx";
import { useEffect, useState } from "react";
import { Table, ScrollArea, Text } from "@mantine/core";
import classes from "./index.module.css";
import { useGetReleaseListForDeployment } from "./hooks/useGetReleaseListForDeployment";
import { useSearchParams } from "@remix-run/react";

export function ReleaseListForDeploymentTable() {
  const { data, isLoading, refetch, isFetching } =
    useGetReleaseListForDeployment("");
  const [searchParams] = useSearchParams();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    console.log("helloooo");
    refetch();
  }, [searchParams.get("deployment")]);

  let rows = data?.map((row) => (
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
  ));

  if (isLoading || isFetching) {
    rows = (
      <Table.Tr>
        <Table.Td colSpan={8}>
          <Text>Loading</Text>
        </Table.Td>
      </Table.Tr>
    );
  }

  // if (!data) {
  //   rows = (
  //     <Table.Tr>
  //       <Table.Td colSpan={8}>
  //         <Text>No Data</Text>
  //       </Table.Td>
  //     </Table.Tr>
  //   );
  // }

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
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
