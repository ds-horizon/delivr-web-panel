import {
  Button,
  Card,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
  Progress,
  Switch,
  rem,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconUpload, IconFolder, IconInfoCircle } from "@tabler/icons-react";
import { useParams } from "@remix-run/react";
import { useGetDeploymentsForApp } from "../../DeploymentList/hooks/getDeploymentsForApp";
import { useCreateRelease } from "./hooks/useCreateRelease";
import { useState, useRef } from "react";
import JSZip from "jszip";

interface ReleaseFormData {
  directory: File | null;
  appVersion: string;
  deploymentName: string;
  rollout: number;
  description: string;
  mandatory: boolean;
  disabled: boolean;
}

export function ReleaseForm() {
  const params = useParams();
  const { data: deployments, isLoading: deploymentsLoading } = useGetDeploymentsForApp();
  const { mutate: createRelease, isLoading: isUploading } = useCreateRelease();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const directoryInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ReleaseFormData>({
    mode: "uncontrolled",
    initialValues: {
      directory: null,
      appVersion: "",
      deploymentName: "",
      rollout: 100,
      description: "",
      mandatory: false,
      disabled: false,
    },
    validate: {
      directory: (value) => {
        if (!value) return "Please select a directory to upload";
        return null;
      },
      appVersion: (value) => {
        if (!value) return "App version is required";
        // Basic semver validation
        const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
        return semverRegex.test(value) ? null : "Please enter a valid version (e.g., 1.0.0)";
      },
      deploymentName: (value) => (!value ? "Please select a deployment" : null),
      rollout: (value) => {
        if (value < 1 || value > 100) return "Rollout must be between 1 and 100";
        return null;
      },
    },
  });

  const createZipFromFiles = async (files: FileList): Promise<Blob> => {
    const zip = new JSZip();
    
    // Process each file and maintain directory structure
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Use the webkitRelativePath to maintain directory structure
      const relativePath = file.webkitRelativePath || file.name;
      zip.file(relativePath, file);
    }
    
    return await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    });
  };

  const handleSubmit = async (values: ReleaseFormData) => {
    if (!values.directory || !params.org || !params.app || !directoryInputRef.current?.files) return;

    setIsProcessing(true);
    
    try {
      console.log(`Creating ZIP from ${directoryInputRef.current.files.length} files...`);
      const zipBlob = await createZipFromFiles(directoryInputRef.current.files);
      const fileToUpload = new File([zipBlob], "bundle.zip", { type: "application/zip" });
      console.log(`Created ZIP file: ${fileToUpload.size} bytes`);

      const formData = new FormData();
      formData.append("package", fileToUpload);
      formData.append("packageInfo", JSON.stringify({
        appVersion: values.appVersion,
        description: values.description,
        rollout: values.rollout,
        isMandatory: values.mandatory,
        isDisabled: values.disabled,
      }));

      createRelease({
        orgName: params.org,
        appName: params.app,
        deploymentName: values.deploymentName,
        formData,
        onProgress: setUploadProgress,
      }, {
        onSuccess: () => {
          form.reset();
          setUploadProgress(0);
          setIsProcessing(false);
          // Reset directory input
          if (directoryInputRef.current) {
            directoryInputRef.current.value = '';
          }
        },
        onError: () => {
          setIsProcessing(false);
        }
      });
    } catch (error) {
      console.error('Error processing files:', error);
      setIsProcessing(false);
    }
  };

  const handleDirectorySelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Create a synthetic File object to represent the directory
      const directoryName = files[0].webkitRelativePath.split('/')[0] || 'Selected Directory';
      const syntheticFile = new File([''], `${directoryName} (${files.length} files)`, { type: 'directory' });
      form.setFieldValue('directory', syntheticFile);
    }
  };

  const deploymentOptions = deployments?.map((deployment) => ({
    value: deployment.name, // Keep using name as value since that's what the API expects
    label: deployment.name,
  })) || [];

  // Remove duplicates based on value (deployment name)
  const uniqueDeploymentOptions = deploymentOptions.filter(
    (option, index, self) => self.findIndex(item => item.value === option.value) === index
  );

  return (
    <Card withBorder radius="md" p="xl">
      <Stack gap="lg">
        <div>
          <Title order={2} size="h3" fw={500}>
            Create New Release
          </Title>
          <Text size="sm" c="dimmed" mt={4}>
            Upload a new version of your app to a deployment
          </Text>
        </div>


        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {/* Directory Upload */}
            <Stack gap="sm">
              <Alert icon={<IconInfoCircle />} color="blue" variant="light">
                <Text size="sm">
                  <strong>Directory Upload:</strong> Select a directory containing your bundle files and assets.
                  <br /><br />
                  <strong>For single bundle files:</strong> Create a directory containing just your bundle file 
                  (e.g., create a folder with <code>index.android.bundle</code> inside).
                </Text>
              </Alert>
              
              <div>
                <Text size="sm" fw={500} mb={5}>
                  Bundle Directory <Text component="span" c="red">*</Text>
                </Text>
                <Text size="xs" c="dimmed" mb={10}>
                  Select a directory containing your bundle file and any assets (required)
                </Text>
                
                <div style={{ position: 'relative' }}>
                  <input
                    ref={directoryInputRef}
                    type="file"
                    webkitdirectory=""
                    multiple
                    required
                    onChange={handleDirectorySelect}
                    disabled={isUploading || isProcessing}
                    style={{
                      position: 'absolute',
                      opacity: 0,
                      width: '100%',
                      height: '100%',
                      cursor: 'pointer'
                    }}
                  />
                  <Button
                    variant="outline"
                    leftSection={<IconFolder style={{ width: rem(16), height: rem(16) }} />}
                    disabled={isUploading || isProcessing}
                    style={{ 
                      width: '100%', 
                      pointerEvents: 'none',
                      borderColor: form.errors.directory ? 'var(--mantine-color-red-5)' : undefined
                    }}
                  >
                    {form.values.directory 
                      ? form.values.directory.name 
                      : 'Choose Directory...'
                    }
                  </Button>
                </div>
                
                {form.values.directory && (
                  <Text size="xs" c="dimmed" mt={5}>
                    Selected: {form.values.directory.name}
                  </Text>
                )}
                
                {form.errors.directory && (
                  <Text size="xs" c="red" mt={5}>
                    {form.errors.directory}
                  </Text>
                )}
              </div>
            </Stack>

            {/* App Version */}
            <TextInput
              label="App Version"
              description="Semantic version of your app (e.g., 1.0.0)"
              placeholder="1.0.0"
              key={form.key("appVersion")}
              {...form.getInputProps("appVersion")}
              disabled={isUploading}
              required
            />

            {/* Deployment Selection */}
            <Select
              label="Target Deployment"
              description="Choose which deployment to release to"
              placeholder={deploymentsLoading ? "Loading deployments..." : "Select deployment"}
              data={uniqueDeploymentOptions}
              key={form.key("deploymentName")}
              {...form.getInputProps("deploymentName")}
              disabled={isUploading || deploymentsLoading}
              required
            />

            {/* Rollout Percentage */}
            <NumberInput
              label="Rollout Percentage"
              description="Percentage of users to receive this update initially"
              placeholder="100"
              min={1}
              max={100}
              suffix="%"
              key={form.key("rollout")}
              {...form.getInputProps("rollout")}
              disabled={isUploading}
            />

            {/* Description */}
            <Textarea
              label="Release Description"
              description="Describe what's new in this release"
              placeholder="Bug fixes and improvements..."
              rows={3}
              key={form.key("description")}
              {...form.getInputProps("description")}
              disabled={isUploading}
            />

            {/* Options */}
            <Group grow>
              <Switch
                label="Mandatory Update"
                description="Force users to install this update"
                key={form.key("mandatory")}
                {...form.getInputProps("mandatory", { type: "checkbox" })}
                disabled={isUploading}
              />
              <Switch
                label="Disabled"
                description="Create release but don't make it available yet"
                key={form.key("disabled")}
                {...form.getInputProps("disabled", { type: "checkbox" })}
                disabled={isUploading}
              />
            </Group>

            {/* Processing Progress */}
            {(isUploading || isProcessing) && (
              <div>
                <Text size="sm" mb={5}>
                  {isProcessing ? 'Processing files...' : `Uploading... ${Math.round(uploadProgress)}%`}
                </Text>
                <Progress 
                  value={isProcessing ? 0 : uploadProgress} 
                  animated={isProcessing || isUploading}
                />
              </div>
            )}

            {/* Submit Button */}
            <Group justify="flex-end">
              <Button
                type="submit"
                leftSection={<IconUpload style={{ width: rem(16), height: rem(16) }} />}
                loading={isUploading || isProcessing}
                disabled={!form.isValid()}
              >
                {isProcessing ? 'Processing...' : 'Create Release'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Card>
  );
}
