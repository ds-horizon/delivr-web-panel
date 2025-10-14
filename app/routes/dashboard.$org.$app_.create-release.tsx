import {
  Box,
  Stepper,
  Button,
  Group,
  Title,
  Text,
  Card,
  Stack,
  TextInput,
  Select,
  Textarea,
  Slider,
  Switch,
  Flex,
  Skeleton,
  Paper,
  rem,
  Modal,
  Alert,
  Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState, useMemo } from "react";
import { useNavigate, useParams, useLoaderData } from "@remix-run/react";
import { IconArrowLeft, IconCheck, IconUpload, IconFolderOpen, IconEye, IconAlertCircle } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { User } from "~/.server/services/Auth/Auth.interface";
import { authenticateLoaderRequest } from "~/utils/authenticate";
import { useGetDeploymentsForApp } from "~/components/Pages/DeploymentList/hooks/getDeploymentsForApp";
import { useCreateRelease } from "~/components/Pages/components/ReleaseForm/hooks/useCreateRelease";
import { useGetOrgList } from "~/components/Pages/components/OrgListNavbar/hooks/useGetOrgList";
import { CombinedSidebar } from "~/components/Pages/components/AppDetailPage/components/CombinedSidebar";
import {
  DirectoryUpload,
} from "~/components/Pages/components/ReleaseForm/components";

export const loader = authenticateLoaderRequest();

interface ReleaseFormData {
  directory: File | null;
  appVersion: string;
  deploymentName: string;
  rollout: number;
  description: string;
  mandatory: boolean;
  disabled: boolean;
}

export default function CreateReleasePage() {
  const navigate = useNavigate();
  const params = useParams();
  const user = useLoaderData<User>();
  
  const [active, setActive] = useState(0);
  const [directoryBlob, setDirectoryBlob] = useState<Blob | null>(null);
  const [directoryName, setDirectoryName] = useState<string>("");
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewModalOpened, setReviewModalOpened] = useState(false);

  const { data: orgs = [], isLoading: orgsLoading } = useGetOrgList();
  const { data: deployments, isLoading: deploymentsLoading } = useGetDeploymentsForApp();
  const { mutate: createRelease, isLoading: isUploading } = useCreateRelease();

  const form = useForm<ReleaseFormData>({
    mode: "controlled",
    initialValues: {
      directory: null,
      appVersion: "",
      deploymentName: "",
      rollout: 1,
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

  const deploymentOptions = useMemo(() => {
    if (!deployments?.length) return [];
    
    const uniqueDeployments = new Map();
    deployments.forEach((deployment, index) => {
      if (!uniqueDeployments.has(deployment.name)) {
        uniqueDeployments.set(deployment.name, {
          value: deployment.name,
          label: deployment.name,
          description: `Key: ${deployment.deploymentKey}`,
        });
      }
    });
    
    return Array.from(uniqueDeployments.values());
  }, [deployments]);

  const handleDirectoryProcess = (blob: Blob, name: string) => {
    setDirectoryBlob(blob);
    setDirectoryName(name);
    form.setFieldValue("directory", { name } as File);
  };

  const nextStep = () => {
    // Validate current step
    if (active === 0) {
      const directoryError = form.validateField("directory");
      if (directoryError.hasError) return;
    } else if (active === 1) {
      const versionError = form.validateField("appVersion");
      const deploymentError = form.validateField("deploymentName");
      if (versionError.hasError || deploymentError.hasError) return;
    } else if (active === 2) {
      const rolloutError = form.validateField("rollout");
      if (rolloutError.hasError) return;
    }
    
    setActive((current) => (current < 3 ? current + 1 : current));
  };

  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const handleSubmit = form.onSubmit((values) => {
    if (!directoryBlob) {
      notifications.show({
        title: "Error",
        message: "Please upload a directory first",
        color: "red",
        icon: <IconAlertCircle size={18} />,
      });
      return;
    }

    const formData = new FormData();
    formData.append("package", directoryBlob, directoryName || "app-bundle.zip");
    formData.append("packageInfo", JSON.stringify({
      description: values.description,
      isDisabled: values.disabled,
      isMandatory: values.mandatory,
      rollout: values.rollout,
    }));
    formData.append("appVersion", values.appVersion);

    createRelease(
      {
        orgName: params.org || "",
        appName: params.app || "",
        deploymentName: values.deploymentName,
        formData,
      },
      {
        onSuccess: () => {
          // The hook already shows a success notification
          setReviewModalOpened(false);
          navigate(`/dashboard/${params.org}/${params.app}`);
        },
        onError: () => {
          // The hook already shows an error notification
          // Just ensure the modal stays open so user can retry
        },
      }
    );
  });

  if (orgsLoading) {
    return (
      <Flex gap="xl">
        <Skeleton width={280} height="calc(100vh - 120px)" />
        <Box style={{ flex: 1 }}>
          <Skeleton height={40} width="100%" mb="md" />
          <Skeleton height={600} width="100%" />
        </Box>
      </Flex>
    );
  }

  return (
    <Flex gap="xl">
      <CombinedSidebar
        organizations={orgs}
        currentOrgId={params.org}
        currentAppId={params.app}
        userEmail={user.user.email}
      />
      <Box style={{ flex: 1 }}>
        {/* Header */}
        <Group mb="xl">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={18} />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Title order={2}>Create New Release</Title>
        </Group>

      {/* Stepper */}
      <Card withBorder shadow="sm" p="xl">
        <Stepper active={active} onStepClick={setActive} breakpoint="sm">
          {/* Step 1: Upload Directory */}
          <Stepper.Step label="Upload" description="Select your app bundle">
            <Box mt="xl">
              <Stack gap="lg">
                <Box>
                  <Title order={4} mb="xs">Upload Your Application Bundle</Title>
                  <Text size="sm" c="dimmed">
                    Select a directory containing your application files. We'll automatically zip and upload it.
                  </Text>
                </Box>

                <Card
                  withBorder
                  padding="xl"
                  radius="md"
                  style={{
                    background: "linear-gradient(135deg, #f8f9fa 0%, #fff 100%)",
                    borderColor: "#e9ecef",
                  }}
                >
                  <Stack gap="md" align="center" py="xl">
                    <Box
                      style={{
                        width: rem(80),
                        height: rem(80),
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                      }}
                    >
                      <IconFolderOpen size={40} color="white" />
                    </Box>
                    
                    <Stack gap="xs" align="center">
                      <Text size="lg" fw={600}>
                        Drop your directory here or click to browse
                      </Text>
                      <Text size="sm" c="dimmed" ta="center">
                        Select a folder containing your app bundle files
                      </Text>
                    </Stack>

                    <DirectoryUpload
                      onDirectorySelect={handleDirectoryProcess}
                      resetTrigger={resetTrigger}
                    />
                    
                    <Paper
                      withBorder
                      p="md"
                      radius="md"
                      style={{ width: "100%", background: "#f8f9fa" }}
                    >
                      <Group gap="xs" wrap="nowrap">
                        <IconUpload size={16} style={{ color: "#667eea", flexShrink: 0 }} />
                        <Text size="xs" c="dimmed">
                          Supported: All file types • We'll create a ZIP archive automatically
                        </Text>
                      </Group>
                    </Paper>
                  </Stack>
                </Card>
              </Stack>
            </Box>
          </Stepper.Step>

          {/* Step 2: Version & Deployment */}
          <Stepper.Step label="Version" description="App version and deployment">
            <Box mt="xl">
              <Stack gap="md">
                <TextInput
                  label="App Version"
                  placeholder="e.g., 1.0.0"
                  required
                  key={form.key("appVersion")}
                  {...form.getInputProps("appVersion")}
                  description="Semantic version of your app (e.g., 1.0.0, 2.1.3)"
                />
                
                <Select
                  label="Deployment"
                  placeholder="Select deployment target"
                  required
                  data={deploymentOptions}
                  key={form.key("deploymentName")}
                  {...form.getInputProps("deploymentName")}
                  disabled={deploymentsLoading}
                  searchable
                  description="Choose the deployment environment"
                />

                <Textarea
                  label="Description"
                  placeholder="Describe what's new in this release..."
                  key={form.key("description")}
                  {...form.getInputProps("description")}
                  minRows={3}
                  description="Optional: Add release notes or description"
                />
              </Stack>
            </Box>
          </Stepper.Step>

          {/* Step 3: Configuration */}
          <Stepper.Step label="Configure" description="Rollout and flags">
            <Box mt="xl">
              <Stack gap="md">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>
                      Rollout Percentage
                    </Text>
                    <Text
                      size="xl"
                      fw={700}
                      style={{
                        color: "#667eea",
                      }}
                    >
                      {form.values.rollout}%
                    </Text>
                  </Group>
                  <Box pt="md" pb="xl">
                    <Slider
                      min={1}
                      max={100}
                      step={1}
                      value={form.values.rollout}
                      onChange={(value) => form.setFieldValue("rollout", value)}
                      marks={[
                        { value: 1, label: "1%" },
                        { value: 25, label: "25%" },
                        { value: 50, label: "50%" },
                        { value: 75, label: "75%" },
                        { value: 100, label: "100%" },
                      ]}
                      styles={{
                        track: {
                          background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                        },
                        thumb: {
                          borderWidth: 2,
                          borderColor: "#667eea",
                          backgroundColor: "white",
                        },
                      }}
                    />
                  </Box>
                  <Text size="xs" c="dimmed">
                    Percentage of users who will receive this update (1-100)
                  </Text>
                </Stack>

                <Switch
                  label="Mandatory Update"
                  description="Users must install this update to continue"
                  key={form.key("mandatory")}
                  {...form.getInputProps("mandatory", { type: "checkbox" })}
                />

                <Switch
                  label="Disabled"
                  description="Temporarily disable this release from being distributed"
                  key={form.key("disabled")}
                  {...form.getInputProps("disabled", { type: "checkbox" })}
                />
              </Stack>
            </Box>
          </Stepper.Step>

        </Stepper>

        {/* Navigation Buttons */}
        <Group justify="space-between" mt="xl">
          <Button variant="default" onClick={prevStep} disabled={active === 0}>
            Back
          </Button>
          
          {active < 2 ? (
            <Button 
              onClick={nextStep}
              variant="gradient"
              gradient={{ from: "#667eea", to: "#764ba2", deg: 135 }}
            >
              Next Step
            </Button>
          ) : (
            <Button
              leftSection={<IconEye size={18} />}
              onClick={() => {
                // Validate step 3
                const rolloutError = form.validateField("rollout");
                if (!rolloutError.hasError) {
                  setReviewModalOpened(true);
                }
              }}
              variant="gradient"
              gradient={{ from: "#667eea", to: "#764ba2", deg: 135 }}
            >
              Review Release
            </Button>
          )}
        </Group>
      </Card>

      {/* Review Modal */}
      <Modal
        opened={reviewModalOpened}
        onClose={() => !isUploading && setReviewModalOpened(false)}
        title={
          <Group gap="xs">
            <IconEye size={24} style={{ color: "#667eea" }} />
            <Title order={3}>Review Your Release</Title>
          </Group>
        }
        size="lg"
        centered
        closeOnClickOutside={!isUploading}
        closeOnEscape={!isUploading}
      >
        <Stack gap="lg" style={{ position: "relative" }}>
          {/* Loading overlay */}
          {isUploading && (
            <Box
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(255, 255, 255, 0.9)",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                gap: "16px",
              }}
            >
              <Loader size="lg" color="#667eea" />
              <Stack gap="xs" align="center">
                <Text fw={600} size="lg">
                  Creating Release...
                </Text>
                <Text size="sm" c="dimmed">
                  Uploading your app bundle
                </Text>
              </Stack>
            </Box>
          )}
          <Text c="dimmed">
            Please review all the details before creating the release. Once created, this cannot be undone.
          </Text>

          <Card withBorder p="lg" style={{ background: "#f8f9fa" }}>
            <Stack gap="md">
              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                  Bundle
                </Text>
                <Group justify="space-between" mt="xs">
                  <Text size="sm" fw={500}>Directory:</Text>
                  <Text size="sm" c="dimmed">{directoryName || "Not selected"}</Text>
                </Group>
              </Box>

              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600} mt="md">
                  Version Information
                </Text>
                <Stack gap="xs" mt="xs">
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>App Version:</Text>
                    <Text size="sm" c="dimmed">{form.values.appVersion || "Not set"}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>Deployment:</Text>
                    <Text size="sm" c="dimmed">{form.values.deploymentName || "Not selected"}</Text>
                  </Group>
                </Stack>
              </Box>

              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600} mt="md">
                  Configuration
                </Text>
                <Stack gap="xs" mt="xs">
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>Rollout:</Text>
                    <Text size="sm" fw={700} style={{ color: "#667eea" }}>
                      {form.values.rollout}%
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>Mandatory Update:</Text>
                    <Text size="sm" c={form.values.mandatory ? "red" : "dimmed"} fw={form.values.mandatory ? 600 : 400}>
                      {form.values.mandatory ? "Yes" : "No"}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>Disabled:</Text>
                    <Text size="sm" c={form.values.disabled ? "orange" : "dimmed"} fw={form.values.disabled ? 600 : 400}>
                      {form.values.disabled ? "Yes" : "No"}
                    </Text>
                  </Group>
                </Stack>
              </Box>

              {form.values.description && (
                <Box>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600} mt="md" mb="xs">
                    Description
                  </Text>
                  <Card withBorder p="md" style={{ background: "white" }}>
                    <Text size="sm">{form.values.description}</Text>
                  </Card>
                </Box>
              )}
            </Stack>
          </Card>

          <Group justify="space-between" mt="md">
            <Button 
              variant="default" 
              onClick={() => setReviewModalOpened(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              leftSection={!isUploading && <IconCheck size={18} />}
              onClick={handleSubmit}
              loading={isUploading}
              disabled={isUploading}
              variant="gradient"
              gradient={{ from: "#667eea", to: "#764ba2", deg: 135 }}
            >
              {isUploading ? "Creating..." : "Create Release"}
            </Button>
          </Group>
        </Stack>
      </Modal>
      </Box>
    </Flex>
  );
}
