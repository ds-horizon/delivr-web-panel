import { useForm } from "@mantine/form";
import {
  Button,
  Group,
  TextInput,
  Autocomplete,
  TagsInput,
} from "@mantine/core";
import { useGetOrgList } from "../OrgListNavbar/hooks/useGetOrgList";
import { useCreateApp } from "./hooks/useCreateApp";
import { useState } from "react";

export function CreateAppForm() {
  const { mutate, isLoading } = useCreateApp();
  const [org, setOrg] = useState({ value: "Select Org", error: "" });
  const orgs = useGetOrgList();

  const form = useForm<{ appName: string }>({
    mode: "uncontrolled",
    validateInputOnChange: true,
    initialValues: {
      appName: "App Name",
    },

    validate: {
      appName: (value) => {
        return value.length ? null : "App Name  Can't be Empty";
      },
    },
  });

  const onOrgChange = (value: string) => {
    if (!value?.length) {
      setOrg({ value: "", error: "Owner Can't be Empty" });
      return;
    }

    setOrg({ value, error: "" });
  };

  return (
    <>
      <TextInput
        label="App Name"
        placeholder="App Name"
        withAsterisk
        key={form.key("appName")}
        disabled={isLoading}
        {...form.getInputProps("appName")}
      />
      <Autocomplete
        mt="md"
        label="Select an Owner"
        withAsterisk
        placeholder="Pick an owner"
        onChange={onOrgChange}
        disabled={isLoading}
        value={org.value}
        error={org.error}
        data={orgs.data?.map((item) => item.orgName) ?? []}
      />
      <TagsInput
        mt="md"
        label="Press Enter to submit a tag"
        placeholder="Enter tag"
        data={["Production", "Stage", "Dev", "Load"]}
        clearable
        disabled={isLoading}
      />
      <Group justify="flex-end" mt="md">
        <Button
          onClick={() => {
            let owner = org.value;
            const _org = orgs.data?.filter(
              (item) => item.orgName === org.value
            );
            if (_org?.length) {
              owner = _org[0].id;
            }
            return mutate({
              name: form.getValues().appName,
              orgId: owner,
            });
          }}
          disabled={
            !!Object.keys(form.errors).length || isLoading || !!org.error.length
          }
          loading={isLoading}
        >
          Create
        </Button>
      </Group>
    </>
  );
}
