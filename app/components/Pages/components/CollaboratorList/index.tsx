import cx from "clsx";
import { useState } from "react";
import {
  Table,
  Checkbox,
  ScrollArea,
  Group,
  Avatar,
  Text,
  rem,
  Flex,
  Button,
  NativeSelect,
} from "@mantine/core";
import classes from "./index.module.css";
import { useGetAppCollaboratorList } from "./hooks/useGetAppCollaboratorList";
import { AddCollboratorForm } from "../AddCollboratorForm";
import { Collaborator } from "./data/getAppCollaborator";

type CollabaratorActionProps = {
  selected: number;
};

const CollabaratorAction = ({ selected }: CollabaratorActionProps) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AddCollboratorForm open={open} onClose={() => setOpen(false)} />
      <Flex align={"center"} justify={"space-between"}>
        <Text>{selected ? `${selected} rows selected` : "Collabarator"}</Text>
        <Button
          color={selected ? "red" : "blue"}
          onClick={() => {
            if (!selected) {
              setOpen(true);
            }
          }}
        >
          {selected ? `Delete ${selected} Collaborator` : "Add Collaborator"}
        </Button>
      </Flex>
    </>
  );
};

export function CollabaratorList() {
  const { data, isLoading, isFetching } = useGetAppCollaboratorList();
  const [selection, setSelection] = useState<string[]>([]);

  const accessTypes: Array<Collaborator["permission"]> = [
    "Owner",
    "Collabarator",
  ];

  const getRows = () => {
    if (isLoading || isFetching) {
      return (
        <Table.Tr key="no-data">
          <Table.Td colSpan={3}>Loading</Table.Td>
        </Table.Tr>
      );
    }

    if (!data?.length) {
      return (
        <Table.Tr key="no-data">
          <Table.Td colSpan={3}>No Data</Table.Td>
        </Table.Tr>
      );
    }

    return data?.map((item) => {
      const selected = selection.includes(item.name);
      return (
        <Table.Tr
          key={item.name}
          className={cx({ [classes.rowSelected]: selected })}
        >
          <Table.Td>
            <Checkbox
              checked={selection.includes(item.name)}
              onChange={() => toggleRow(item.name)}
            />
          </Table.Td>
          <Table.Td>
            <Group gap="sm">
              <Avatar size={26} radius={26} name={item.name} />
              <Text size="sm" fw={500}>
                {item.name}
              </Text>
            </Group>
          </Table.Td>
          <Table.Td>
            <NativeSelect value={item.permission} data={accessTypes} />
          </Table.Td>
        </Table.Tr>
      );
    });
  };

  const toggleRow = (id: string) =>
    setSelection((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );

  const toggleAll = () => {
    if (!data) return;
    setSelection((current) =>
      current.length === data.length ? [] : data.map((item) => item.name)
    );
  };

  const rows = getRows();

  return (
    <>
      <CollabaratorAction selected={selection.length} />
      <ScrollArea>
        <Table w={"100%"} verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: rem(40) }}>
                <Checkbox
                  onChange={toggleAll}
                  checked={selection.length === data?.length}
                  indeterminate={
                    selection.length > 0 && selection.length !== data?.length
                  }
                />
              </Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Access</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </ScrollArea>
    </>
  );
}
