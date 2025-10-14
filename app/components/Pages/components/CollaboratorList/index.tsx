import { useState } from "react";
import {
  Card,
  Stack,
  Group,
  Avatar,
  Text,
  Button,
  Select,
  Skeleton,
  Badge,
  ActionIcon,
  Tooltip,
  Box,
  Flex,
  LoadingOverlay,
} from "@mantine/core";
import { IconTrash, IconUserPlus, IconCrown, IconUser } from "@tabler/icons-react";

import { useGetAppCollaboratorList } from "./hooks/useGetAppCollaboratorList";
import { useUpdateCollabarator } from "./hooks/useUpdateCollabarator";
import { useRemoveCollabarator } from "./hooks/useRemoveCollabarator";
import { AddCollboratorForm } from "../AddCollboratorForm";
import { useParams } from "@remix-run/react";
import { Collaborator } from "./data/getAppCollaborator";

// Helper to generate initials
const getInitials = (name: string) => {
  const parts = name.split("@")[0].split(".");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Helper to generate avatar color
const getAvatarColor = (name: string) => {
  const colors = ["#667eea", "#764ba2", "#f093fb", "#4facfe", "#43e97b", "#fa709a"];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export function CollabaratorList() {
  const { data, isLoading, isFetching, refetch } = useGetAppCollaboratorList();
  const [open, setOpen] = useState(false);
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  if (isLoading || isFetching) {
    return (
      <Stack gap="md">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} height={100} radius="md" />
          ))}
      </Stack>
    );
  }

  if (!data?.length) {
    return (
      <Card withBorder padding="xl" radius="md" style={{ textAlign: "center" }}>
        <Stack gap="md" align="center">
          <IconUser size={48} color="#ccc" />
          <Text size="lg" fw={500} c="dimmed">
            No Collaborators Yet
          </Text>
          <Text size="sm" c="dimmed">
            Add team members to collaborate on this app
          </Text>
          <Button
            leftSection={<IconUserPlus size={18} />}
            onClick={() => setOpen(true)}
            variant="gradient"
            gradient={{ from: "#667eea", to: "#764ba2", deg: 135 }}
          >
            Add Collaborator
          </Button>
        </Stack>
      </Card>
    );
  }

  return (
    <>
      <AddCollboratorForm open={open} onClose={() => setOpen(false)} />
      
      <Group justify="flex-end" mb="md">
        <Button
          leftSection={<IconUserPlus size={18} />}
          onClick={() => setOpen(true)}
          variant="gradient"
          gradient={{ from: "#667eea", to: "#764ba2", deg: 135 }}
        >
          Add Collaborator
        </Button>
      </Group>

      <Stack gap="md">
        {data.map((collaborator) => (
          <CollaboratorCard
            key={collaborator.name}
            collaborator={collaborator}
            refetch={refetch}
            isLoading={loadingItems.has(collaborator.name)}
            onLoadingChange={(loading) => {
              setLoadingItems((prev) => {
                const next = new Set(prev);
                if (loading) {
                  next.add(collaborator.name);
                } else {
                  next.delete(collaborator.name);
                }
                return next;
              });
            }}
          />
        ))}
      </Stack>
    </>
  );
}

function CollaboratorCard({
  collaborator,
  refetch,
  isLoading,
  onLoadingChange,
}: {
  collaborator: Collaborator;
  refetch: () => void;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
}) {
  const params = useParams();
  const { mutate: updatePermission } = useUpdateCollabarator();
  const { mutate: removeCollaborator } = useRemoveCollabarator();
  const [isDeleting, setIsDeleting] = useState(false);

  const initials = getInitials(collaborator.name);
  const avatarColor = getAvatarColor(collaborator.name);

  const handlePermissionChange = (value: string | null) => {
    if (!value) return;
    onLoadingChange(true);
    updatePermission(
      {
        appId: params.app ?? "",
        tenant: params.org ?? "",
        email: collaborator.name,
        role: value as Collaborator["permission"],
      },
      {
        onSuccess: () => {
          refetch();
          onLoadingChange(false);
        },
        onError: () => {
          onLoadingChange(false);
        },
      }
    );
  };

  const handleDelete = () => {
    setIsDeleting(true);
    onLoadingChange(true);
    removeCollaborator(
      {
        appId: params.app ?? "",
        tenant: params.org ?? "",
        email: collaborator.name,
      },
      {
        onSuccess: () => {
          refetch();
          setIsDeleting(false);
          onLoadingChange(false);
        },
        onError: () => {
          setIsDeleting(false);
          onLoadingChange(false);
        },
      }
    );
  };

  return (
    <Card
      withBorder
      padding="lg"
      radius="md"
      style={{
        transition: "all 200ms ease",
        position: "relative",
      }}
      styles={{
        root: {
          "&:hover": {
            boxShadow: "0 4px 16px rgba(103, 126, 234, 0.15)",
          },
        },
      }}
    >
      <LoadingOverlay visible={isLoading} />
      <Group justify="space-between" wrap="nowrap">
        <Group gap="md" style={{ flex: 1, minWidth: 0 }}>
          <Box
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${avatarColor} 0%, ${avatarColor}dd 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 2px 8px ${avatarColor}40`,
              flexShrink: 0,
            }}
          >
            <Text size="lg" fw={700} c="white">
              {initials}
            </Text>
          </Box>

          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text fw={600} size="md" style={{ wordBreak: "break-all" }}>
              {collaborator.name}
            </Text>
            <Group gap="xs" mt={4}>
              {collaborator.permission === "Owner" ? (
                <Badge
                  leftSection={<IconCrown size={12} />}
                  variant="light"
                  color="yellow"
                  size="sm"
                >
                  Owner
                </Badge>
              ) : (
                <Badge variant="light" color="blue" size="sm">
                  Collaborator
                </Badge>
              )}
            </Group>
          </Box>
        </Group>

        <Group gap="sm" wrap="nowrap">
          <Select
            data={[
              { value: "Owner", label: "Owner" },
              { value: "Collaborator", label: "Collaborator" },
            ]}
            value={collaborator.permission}
            onChange={handlePermissionChange}
            disabled={isLoading}
            style={{ width: 150 }}
            styles={{
              input: {
                borderColor: "#667eea",
              },
            }}
          />

          <Tooltip label="Remove Collaborator">
            <ActionIcon
              variant="light"
              color="red"
              size="lg"
              onClick={handleDelete}
              loading={isDeleting}
              disabled={isLoading}
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Card>
  );
}
