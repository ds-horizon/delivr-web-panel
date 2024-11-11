import {
  useForm,
  isNotEmpty,
  isEmail,
  isInRange,
  hasLength,
  matches,
} from "@mantine/form";
import {
  Button,
  Group,
  TextInput,
  Autocomplete,
  TagsInput,
} from "@mantine/core";
import { useGetOrgList } from "../OrgListNavbar/hooks/useGetOrgList";

export function CreateAppForm() {
  const { data } = useGetOrgList();
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      appName: "",
      job: data?.map((item) => item.orgName) ?? [],
      email: "",
      favoriteColor: "",
      age: 18,
    },

    validate: {
      appName: hasLength(
        { min: 3, max: 20 },
        "Name must be 3-20 characters long"
      ),
      job: isNotEmpty("Enter your current job"),
      email: isEmail("Invalid email"),
      favoriteColor: matches(
        /^#([0-9a-f]{3}){1,2}$/,
        "Enter a valid hex color"
      ),
      age: isInRange(
        { min: 18, max: 99 },
        "You must be 18-99 years old to register"
      ),
    },
  });

  return (
    <form onSubmit={form.onSubmit(() => {})}>
      <TextInput
        label="App Name"
        placeholder="App Name"
        withAsterisk
        key={form.key("appName")}
        {...form.getInputProps("appName")}
      />
      <Autocomplete
        mt="md"
        label="Select an Owner"
        placeholder="Pick an owner"
        data={data?.map((item) => item.orgName) ?? []}
      />
      <TagsInput
        mt="md"
        label="Press Enter to submit a tag"
        placeholder="Enter tag"
        data={["Production", "Stage", "Dev", "Load"]}
        clearable
      />
      <Group justify="flex-end" mt="md">
        <Button type="submit">Submit</Button>
      </Group>
    </form>
  );
}
