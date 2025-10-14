import {
  Card,
  Group,
  Text,
  ActionIcon,
  Tooltip,
  Badge,
  Stack,
  Box,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { AppCardResponse } from "../../AppList/data/getAppListForOrg";

type AppListRowProps = {
  app: AppCardResponse;
  onNavigate: () => void;
  onDelete: () => void;
};

// Generate consistent color based on app name
const getAppColor = (appName: string) => {
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
  
  const hash = appName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Generate initials from app name
const getInitials = (appName: string) => {
  const words = appName.trim().split(" ");
  if (words.length === 1) {
    return appName.substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
};

export function AppListRow({ app, onNavigate, onDelete }: AppListRowProps) {
  const colors = getAppColor(app.name);
  const initials = getInitials(app.name);

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
            color={app.isAdmin ? "violet" : "gray"}
            size="sm"
            radius="md"
          >
            {app.role}
          </Badge>
          {app.isAdmin && (
            <Tooltip label="Delete App" position="left">
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

        {/* App Name */}
        <Box style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Text fw={600} size="lg" ta="center" lineClamp={2}>
            {app.name}
          </Text>
        </Box>
      </Stack>
    </Card>
  );
}

