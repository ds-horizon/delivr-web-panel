import {
  Card,
  Text,
  ActionIcon,
  Tooltip,
  Box,
  Group,
  Stack,
  Badge,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

type Organization = {
  id: string;
  orgName: string;
  isAdmin: boolean;
};

type OrgCardProps = {
  org: Organization;
  onNavigate: () => void;
  onDelete: () => void;
};

// Generate consistent color based on org name
const getOrgColor = (orgName: string) => {
  const colors = [
    { bg: "#667eea", light: "#f0f0ff" },
    { bg: "#764ba2", light: "#f5f0ff" },
    { bg: "#f093fb", light: "#fff0fb" },
    { bg: "#4facfe", light: "#f0f8ff" },
    { bg: "#43e97b", light: "#f0fff5" },
    { bg: "#fa709a", light: "#fff0f5" },
    { bg: "#feca57", light: "#fff8e1" },
    { bg: "#48dbfb", light: "#e6f9ff" },
  ];
  
  const hash = orgName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Generate initials from org name
const getInitials = (orgName: string) => {
  const words = orgName.trim().split(" ");
  if (words.length === 1) {
    return orgName.substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
};

export function OrgCard({ org, onNavigate, onDelete }: OrgCardProps) {
  const colors = getOrgColor(org.orgName);
  const initials = getInitials(org.orgName);

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{
        cursor: "pointer",
        transition: "all 200ms ease",
        width: "250px",
        height: "250px",
      }}
      styles={{
        root: {
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 32px rgba(102, 126, 234, 0.3)",
          },
        },
      }}
      onClick={onNavigate}
    >
      <Stack gap="md" h="100%">
        {/* Header with badge and delete button */}
        <Group justify="flex-end" wrap="nowrap" gap="xs">
          <Badge
            variant="light"
            color={org.isAdmin ? "violet" : "gray"}
            size="sm"
            radius="md"
          >
            {org.isAdmin ? "Owner" : "Member"}
          </Badge>
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

        {/* Icon/Avatar */}
        <Box style={{ display: "flex", justifyContent: "center" }}>
          <Box
            style={{
              width: 64,
              height: 64,
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg}dd 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 12px ${colors.bg}40`,
            }}
          >
            <Text
              size="lg"
              fw={700}
              c="white"
              style={{
                fontSize: "22px",
                letterSpacing: "1px",
              }}
            >
              {initials}
            </Text>
          </Box>
        </Box>

        {/* Org Name */}
        <Box style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Text fw={600} size="lg" ta="center" lineClamp={2}>
            {org.orgName}
          </Text>
        </Box>
      </Stack>
    </Card>
  );
}

