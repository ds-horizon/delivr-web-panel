import {
  Card,
  Text,
  ActionIcon,
  Badge,
  Menu,
  Box,
  Group,
  Stack,
  useMantineTheme,
} from "@mantine/core";
import { IconTrash, IconDots, IconExternalLink, IconBuilding } from "@tabler/icons-react";

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
  const theme = useMantineTheme();
  
  return (
    <Card
      withBorder
      padding="xl"
      radius="lg"
      style={{
        cursor: "pointer",
        transition: theme.other.transitions.slow,
        height: "100%",
        borderColor: theme.other.borders.primary,
        backgroundColor: theme.other.backgrounds.primary,
        position: "relative",
        overflow: "visible",
      }}
      styles={{
        root: {
          "&:hover": {
            borderColor: theme.other.borders.brand,
            boxShadow: theme.other.shadows.lg,
            transform: "translateY(-8px)",
          },
        },
      }}
      onClick={onNavigate}
    >
      <Card.Section 
        h={80} 
        style={{ 
          background: theme.other.brand.gradient,
        }} 
      />

      <Box 
        style={{ 
          display: "flex", 
          justifyContent: "center",
          marginTop: `-${theme.other.sizes.avatar.lg}`,
          marginBottom: theme.other.spacing.lg,
        }}
      >
        <Box
          style={{
            width: theme.other.sizes.avatar.xl,
            height: theme.other.sizes.avatar.xl,
            borderRadius: theme.other.borderRadius.xl,
            background: theme.other.backgrounds.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `4px solid ${theme.other.backgrounds.primary}`,
            boxShadow: theme.other.shadows.md,
          }}
        >
          <IconBuilding 
            size={theme.other.sizes.icon["4xl"]} 
            color={theme.other.brand.primary}
            stroke={1.5}
          />
        </Box>
      </Box>

      <Group
        justify="space-between"
        wrap="nowrap"
        style={{
          position: "absolute",
          top: theme.other.spacing.md,
          right: theme.other.spacing.md,
          left: theme.other.spacing.md,
        }}
      >
        <Badge
          variant="light"
          size="xs"
          radius="sm"
          style={{
            textTransform: "uppercase",
            fontSize: theme.other.typography.fontSize.xs,
            fontWeight: theme.other.typography.fontWeight.semibold,
            letterSpacing: theme.other.typography.letterSpacing.wide,
            backgroundColor: `rgba(255, 255, 255, ${theme.other.opacity.overlay})`,
            color: theme.other.brand.primaryDark,
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
                  backgroundColor: `rgba(255, 255, 255, ${theme.other.opacity.subtle})`,
                }}
              >
                <IconDots size={theme.other.sizes.icon.md} />
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
        <Text 
          ta="center" 
          size="xl" 
          fw={theme.other.typography.fontWeight.semibold} 
          lineClamp={2}
          style={{
            color: theme.other.text.primary,
            minHeight: theme.other.spacing["3xl"],
          }}
        >
          {org.orgName}
        </Text>

        <Text 
          ta="center" 
          size="sm" 
          c="dimmed"
          fw={theme.other.typography.fontWeight.medium}
        >
          {org.isAdmin ? "You own this organization" : "You are a member"}
        </Text>
      </Stack>
    </Card>
  );
}

