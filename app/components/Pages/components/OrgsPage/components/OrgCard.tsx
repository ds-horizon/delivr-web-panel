import {
  Card,
  Text,
  ActionIcon,
  Badge,
  Menu,
  Box,
  Group,
  Stack,
} from "@mantine/core";
import { IconTrash, IconDots, IconExternalLink, IconBuilding } from "@tabler/icons-react";
import { brand, backgrounds, text, borders, shadows } from "~/theme";

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

export function OrgCard({ org, onNavigate, onDelete }: OrgCardProps) {
  return (
    <Card
      withBorder
      padding="xl"
      radius="lg"
      style={{
        cursor: "pointer",
        transition: "all 250ms ease",
        height: "100%",
        borderColor: borders.primary,
        backgroundColor: backgrounds.primary,
        position: "relative",
        overflow: "visible",
      }}
      styles={{
        root: {
          "&:hover": {
            borderColor: borders.brand,
            boxShadow: shadows.lg,
            transform: "translateY(-8px)",
          },
        },
      }}
      onClick={onNavigate}
    >
      {/* Gradient Header Section */}
      <Card.Section 
        h={80} 
        style={{ 
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        }} 
      />

      {/* Icon Container - Overlapping Header */}
      <Box 
        style={{ 
          display: "flex", 
          justifyContent: "center",
          marginTop: "-40px",
          marginBottom: "16px",
        }}
      >
        <Box
          style={{
            width: 80,
            height: 80,
            borderRadius: "20px",
            background: backgrounds.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `4px solid ${backgrounds.primary}`,
            boxShadow: shadows.md,
          }}
        >
          <IconBuilding 
            size={40} 
            color={brand.primary}
            stroke={1.5}
          />
        </Box>
      </Box>

      {/* Badge and Menu positioned at top right */}
      <Group
        justify="space-between"
        wrap="nowrap"
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
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            color: brand.primaryDark,
          }}
        >
          {org.isAdmin ? "Owner" : "Member"}
        </Badge>
        {org.isAdmin && (
          <Menu shadow="md" width={180} position="bottom-end">
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="white"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                }}
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
                Open Organization
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
                Delete Organization
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>

      <Stack gap="sm" align="center">
        {/* Org Name */}
        <Text 
          ta="center" 
          size="xl" 
          fw={600} 
          lineClamp={2}
          style={{
            color: text.primary,
            minHeight: "32px",
          }}
        >
          {org.orgName}
        </Text>

        {/* Role subtitle */}
        <Text 
          ta="center" 
          size="sm" 
          c="dimmed"
          fw={500}
        >
          {org.isAdmin ? "You own this organization" : "You are a member"}
        </Text>
      </Stack>
    </Card>
  );
}

