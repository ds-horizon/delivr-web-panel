import {
  Select,
  TextInput,
  Textarea,
  NumberInput,
  Switch,
  Stack,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";

interface ReleaseFormData {
  directory: File | null;
  appVersion: string;
  deploymentName: string;
  rollout: number;
  description: string;
  mandatory: boolean;
  disabled: boolean;
}

interface ReleaseMetadataProps {
  form: UseFormReturnType<ReleaseFormData>;
  deploymentOptions: Array<{ value: string; label: string }>;
  deploymentsLoading: boolean;
}

export function ReleaseMetadata({ form, deploymentOptions, deploymentsLoading }: ReleaseMetadataProps) {
  return (
    <Stack gap="md">
      {/* App Version */}
      <TextInput
        label="App Version"
        placeholder="e.g., 1.0.0"
        required
        key={form.key("appVersion")}
        {...form.getInputProps("appVersion")}
        description="Semantic version of your app (e.g., 1.0.0, 2.1.3)"
      />

      {/* Target Deployment */}
      <Select
        label="Target Deployment"
        placeholder="Select deployment"
        required
        data={deploymentOptions}
        key={form.key("deploymentName")}
        {...form.getInputProps("deploymentName")}
        disabled={deploymentsLoading}
        description="The deployment environment to release to"
      />

      {/* Rollout Percentage */}
      <NumberInput
        label="Rollout Percentage"
        placeholder="100"
        required
        min={1}
        max={100}
        key={form.key("rollout")}
        {...form.getInputProps("rollout")}
        description="Percentage of users who will receive this update (1-100)"
      />

      {/* Description */}
      <Textarea
        label="Release Description"
        placeholder="Describe what's new in this release..."
        key={form.key("description")}
        {...form.getInputProps("description")}
        description="Optional description of changes in this release"
        rows={3}
      />

      {/* Release Options */}
      <Stack gap="xs">
        <Switch
          label="Mandatory Update"
          description="Force users to install this update immediately"
          key={form.key("mandatory")}
          {...form.getInputProps("mandatory", { type: "checkbox" })}
        />
        
        <Switch
          label="Disabled Release"
          description="Create the release but keep it disabled initially"
          key={form.key("disabled")}
          {...form.getInputProps("disabled", { type: "checkbox" })}
        />
      </Stack>
    </Stack>
  );
}
