import {
  Group,
  Text,
  ActionIcon,
  Tooltip,
  Box,
  UnstyledButton,
} from "@mantine/core";
import { IconTrash, IconBuilding } from "@tabler/icons-react";

type Organization = {
  id: string;
  orgName: string;
  isAdmin: boolean;
};

type OrgRowProps = {
  org: Organization;
  onNavigate: () => void;
  onDelete: () => void;
};

export function OrgRow({ org, onNavigate, onDelete }: OrgRowProps) {
  return (
    <UnstyledButton
      onClick={onNavigate}
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: "8px",
        transition: "background-color 150ms ease",
      }}
      styles={{
        root: {
          "&:hover": {
            backgroundColor: "rgba(103, 126, 234, 0.08)",
          },
        },
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group wrap="nowrap" gap="sm">
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              backgroundColor: "rgba(103, 126, 234, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconBuilding size={18} style={{ color: "#667eea" }} />
          </Box>
          <Text fw={500} size="sm" c="gray.9">
            {org.orgName}
          </Text>
        </Group>

        {org.isAdmin && (
          <Tooltip label="Delete Organization" position="left">
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    </UnstyledButton>
  );
}

