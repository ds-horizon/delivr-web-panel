import {
  Card,
  Text,
  ActionIcon,
  Badge,
  Menu,
  Avatar,
  Flex,
} from "@mantine/core";
import { IconTrash, IconDots, IconExternalLink } from "@tabler/icons-react";
import { AppCardResponse } from "../../AppList/data/getAppListForOrg";
import { brand, backgrounds, borders, shadows } from "~/theme";

type AppListRowProps = {
  app: AppCardResponse;
  onNavigate: () => void;
  onDelete: () => void;
};

export function AppListRow({ app, onNavigate, onDelete }: AppListRowProps) {
  return (
    <Card
      withBorder
      padding="xl"
      radius="md"
      style={{
        cursor: "pointer",
        transition: "all 200ms ease",
        width: "300px",
        borderColor: borders.primary,
        backgroundColor: backgrounds.primary,
        overflow: "visible",
      }}
      styles={{
        root: {
          "&:hover": {
            borderColor: borders.brand,
            boxShadow: shadows.hover,
            transform: "translateY(-4px)",
          },
        },
      }}
      onClick={onNavigate}
    >
      {/* Header Section - Empty colored area */}
      <Card.Section h={100} style={{ background: backgrounds.subtle }} />
      
      {/* Avatar overlapping the header section */}
      <Avatar
        name={app.name}
        color="indigo"
        size={80}
        radius={80}
        style={{
          margin: "0 auto",
          marginTop: "-40px",
          border: `4px solid ${backgrounds.primary}`,
          boxShadow: shadows.sm,
        }}
      />

      {/* Badge and Menu positioned at top right */}
      <Flex
        justify="space-between"
        align="center"
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          left: "12px",
        }}
      >
        <Badge
          variant="light"
          size="xs"
          radius="sm"
          style={{
            textTransform: "uppercase",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.5px",
            backgroundColor: brand.light,
            color: brand.primaryDark,
          }}
        >
          {app.role}
        </Badge>
        {app.isAdmin && (
          <Menu shadow="md" width={150} position="bottom-end">
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconExternalLink size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate();
                }}
              >
                Open App
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                Delete App
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Flex>

      {/* App Name */}
      <Text ta="center" size="lg" fw={500} mt="sm" lineClamp={2}>
        {app.name}
      </Text>
    </Card>
  );
}

