import {
  Card,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useParams } from "@remix-run/react";
import { useGetDeploymentsForApp } from "../../DeploymentList/hooks/getDeploymentsForApp";
import { useCreateRelease } from "./hooks/useCreateRelease";
import { useState, useMemo } from "react";
import { 
  DirectoryUpload, 
  ContextFields, 
  ReleaseMetadata, 
  ReleaseFormActions 
} from "./components";

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
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [directoryBlob, setDirectoryBlob] = useState<Blob | null>(null);
  const [directoryName, setDirectoryName] = useState<string>("");

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
        if (!directoryBlob) {
          return "Please select a directory to upload";
        }
        return null;
      },
      appVersion: (value) => {
        if (!value.trim()) {
          return "App version is required";
        }
        // Basic semver validation
        const semverRegex = /^\d+\.\d+\.\d+(-[\w\.-]+)?$/;
        if (!semverRegex.test(value.trim())) {
          return "App version must be a valid semantic version (e.g., 1.0.0)";
        }
        return null;
      },
      deploymentName: (value) => (!value ? "Please select a deployment" : null),
      rollout: (value) => {
        if (value < 1 || value > 100) {
          return "Rollout must be between 1 and 100";
        }
        return null;
      },
    },
  });

  // Process deployments data and remove duplicates
  const deploymentOptions = useMemo(() => {
    if (!deployments?.length) return [];
    
    // Debug logging
    console.log('🔍 Raw deployments data:', deployments);
    
    // Create a Map to deduplicate by name (keep the first occurrence)
    const uniqueDeployments = new Map();
    deployments.forEach((deployment, index) => {
      if (!uniqueDeployments.has(deployment.name)) {
        uniqueDeployments.set(deployment.name, {
          value: deployment.name,
          label: deployment.name,
          originalIndex: index
        });
      } else {
        console.log('🚫 Duplicate deployment found:', deployment.name, 'at index', index);
      }
    });
    
    const options = Array.from(uniqueDeployments.values());
    console.log('✅ Final deployment options:', options);
    
    return options;
  }, [deployments]);

  const handleDirectorySelect = (zipBlob: Blob, dirName: string) => {
    setDirectoryBlob(zipBlob);
    setDirectoryName(dirName);
    // Create a fake File object for form validation
    const fakeFile = new File([zipBlob], `${dirName}.zip`, { type: 'application/zip' });
    form.setFieldValue('directory', fakeFile);
    form.clearFieldError('directory');
  };

  const handleSubmit = (values: ReleaseFormData) => {
    if (!directoryBlob || !params.org || !params.app) {
      console.error("Missing required data for release");
      return;
    }

    // Create FormData for the API call
    const formData = new FormData();
    
    // Add the ZIP file as 'package'
    formData.append("package", directoryBlob, `${directoryName}.zip`);
    
    // Create packageInfo object
    const packageInfo = {
      appVersion: values.appVersion,
      description: values.description,
      rollout: values.rollout,
      isMandatory: values.mandatory,
      isDisabled: values.disabled,
    };
    
    formData.append("packageInfo", JSON.stringify(packageInfo));

    createRelease(
      {
        orgName: params.org,
        appName: params.app,
        deploymentName: values.deploymentName,
        formData,
      },
      {
        onSuccess: () => {
          // Reset form and state on success
          form.reset();
          setDirectoryBlob(null);
          setDirectoryName("");
        },
      }
    );
  };

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

        {/* Context Information */}
        <ContextFields />

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {/* Directory Upload */}
            <DirectoryUpload
              onDirectorySelect={handleDirectorySelect}
              disabled={isUploading || isProcessing}
              error={form.errors.directory as string}
            />

            {/* Release Metadata */}
            <ReleaseMetadata
              form={form}
              deploymentOptions={deploymentOptions}
              deploymentsLoading={deploymentsLoading}
            />

            {/* Form Actions */}
            <ReleaseFormActions
              isUploading={isUploading}
              isProcessing={isProcessing}
              hasDirectory={!!directoryBlob}
            />
          </Stack>
        </form>
      </Stack>
    </Card>
  );
}