import {
  Box,
  Text,
  UnstyledButton,
  Stack,
  ScrollArea,
  ActionIcon,
  Tooltip,
  Collapse,
  Divider,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
  IconUsers,
} from "@tabler/icons-react";
import { useNavigate } from "@remix-run/react";
import { route } from "routes-gen";
import { useState } from "react";
import { useGetAppListForOrg } from "../../AppList/hooks/useGetAppListForOrg";

type Organization = {
  id: string;
  orgName: string;
  isAdmin: boolean;
};

type CombinedSidebarProps = {
  organizations: Organization[];
  currentOrgId?: string;
  currentAppId?: string;
  userEmail: string;
  onCollaboratorsClick?: () => void;
  showCollaborators?: boolean;
};

// Generate consistent color based on name
const getColor = (name: string) => {
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

  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Generate initials from name
const getInitials = (name: string) => {
  const words = name.trim().split(" ");
  if (words.length === 1) {
    return name.substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
};

// Component for each organization with its apps
function OrgWithApps({
  org,
  isActive,
  isCollapsed,
  isSidebarCollapsed,
  currentAppId,
  userEmail,
  onToggle,
}: {
  org: Organization;
  isActive: boolean;
  isCollapsed: boolean;
  isSidebarCollapsed: boolean;
  currentAppId?: string;
  userEmail: string;
  onToggle: () => void;
}) {
  const navigate = useNavigate();
  const colors = getColor(org.orgName);
  const initials = getInitials(org.orgName);

  const { data: apps = [], isLoading } = useGetAppListForOrg({
    orgId: org.id,
    userEmail: userEmail,
  });

  if (isSidebarCollapsed) {
    // Collapsed sidebar view - icon only
    return (
      <Tooltip key={org.id} label={org.orgName} position="right" withArrow>
        <UnstyledButton
          onClick={() => {
            navigate(route("/dashboard/:org/apps", { org: org.id }));
          }}
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "12px",
            transition: "all 150ms ease",
            border: isActive ? "2px solid #667eea" : "2px solid transparent",
            padding: "2px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "10px",
              background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg}dd 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isActive
                ? `0 4px 12px ${colors.bg}60`
                : `0 2px 8px ${colors.bg}40`,
            }}
          >
            <Text
              size="sm"
              fw={700}
              c="white"
              style={{
                fontSize: "16px",
                letterSpacing: "0.5px",
              }}
            >
              {initials}
            </Text>
          </Box>
        </UnstyledButton>
      </Tooltip>
    );
  }

  // Expanded sidebar view
  return (
    <Box>
      {/* Organization Header */}
      <UnstyledButton
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: "8px",
          transition: "background-color 150ms ease",
          backgroundColor: isActive
            ? "rgba(103, 126, 234, 0.12)"
            : "transparent",
          border: isActive ? "2px solid #667eea" : "2px solid transparent",
        }}
        styles={{
          root: {
            "&:hover": {
              backgroundColor: isActive
                ? "rgba(103, 126, 234, 0.12)"
                : "rgba(103, 126, 234, 0.08)",
            },
          },
        }}
      >
        <Box style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Box
            style={{
              width: 36,
              height: 36,
              borderRadius: "8px",
              background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg}dd 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 2px 8px ${colors.bg}40`,
            }}
          >
            <Text
              size="xs"
              fw={700}
              c="white"
              style={{
                fontSize: "14px",
                letterSpacing: "0.5px",
              }}
            >
              {initials}
            </Text>
          </Box>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text
              fw={isActive ? 600 : 500}
              size="sm"
              c={isActive ? "#667eea" : "gray.9"}
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {org.orgName}
            </Text>
          </Box>
          <ActionIcon
            size="xs"
            variant="subtle"
            color="gray"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isCollapsed ? (
              <IconChevronRight size={14} />
            ) : (
              <IconChevronDown size={14} />
            )}
          </ActionIcon>
        </Box>
      </UnstyledButton>

      {/* Apps List - Collapsible */}
      <Collapse in={!isCollapsed}>
        <Box style={{ paddingLeft: "20px", marginTop: "4px" }}>
          {isLoading ? (
            <Text size="xs" c="dimmed" p="xs">
              Loading apps...
            </Text>
          ) : apps.length === 0 ? (
            <Text size="xs" c="dimmed" p="xs">
              No apps
            </Text>
          ) : (
            <Stack gap="xs">
              {apps.map((app) => {
                const appColors = getColor(app.name);
                const appInitials = getInitials(app.name);
                const isAppActive = app.id === currentAppId;

                return (
                  <UnstyledButton
                    key={app.id}
                    onClick={() => {
                      navigate(
                        route("/dashboard/:org/:app", {
                          org: org.id,
                          app: app.id,
                        })
                      );
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      transition: "background-color 150ms ease",
                      backgroundColor: isAppActive
                        ? "rgba(103, 126, 234, 0.08)"
                        : "transparent",
                      borderLeft: isAppActive
                        ? "3px solid #667eea"
                        : "3px solid transparent",
                    }}
                    styles={{
                      root: {
                        "&:hover": {
                          backgroundColor: "rgba(103, 126, 234, 0.05)",
                        },
                      },
                    }}
                  >
                    <Box
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Box
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "4px",
                          background: `linear-gradient(135deg, ${appColors.bg} 0%, ${appColors.bg}dd 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: `0 1px 4px ${appColors.bg}30`,
                        }}
                      >
                        <Text
                          size="xs"
                          fw={700}
                          c="white"
                          style={{
                            fontSize: "10px",
                            letterSpacing: "0.3px",
                          }}
                        >
                          {appInitials}
                        </Text>
                      </Box>
                      <Text
                        fw={isAppActive ? 600 : 400}
                        size="xs"
                        c={isAppActive ? "#667eea" : "gray.7"}
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                        }}
                      >
                        {app.name}
                      </Text>
                    </Box>
                  </UnstyledButton>
                );
              })}
            </Stack>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

export function CombinedSidebar({
  organizations,
  currentOrgId,
  currentAppId,
  userEmail,
  onCollaboratorsClick,
  showCollaborators = false,
}: CombinedSidebarProps) {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(
    new Set(currentOrgId ? [currentOrgId] : [])
  );

  const toggleOrg = (orgId: string) => {
    setExpandedOrgs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orgId)) {
        newSet.delete(orgId);
      } else {
        newSet.add(orgId);
      }
      return newSet;
    });
  };

  return (
    <Box
      style={{
        width: isSidebarCollapsed ? "80px" : "280px",
        height: "calc(100vh - 120px)",
        borderRight: "1px solid #e9ecef",
        paddingRight: isSidebarCollapsed ? "0" : "16px",
        transition: "width 200ms ease",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack gap="xs" style={{ paddingLeft: isSidebarCollapsed ? "8px" : "0", flex: 1 }}>
        {/* Header with collapse button */}
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isSidebarCollapsed ? "center" : "space-between",
            marginBottom: "8px",
          }}
        >
          {!isSidebarCollapsed && (
            <Text size="sm" c="dimmed" fw={600} tt="uppercase">
              Navigation
            </Text>
          )}
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            size="sm"
          >
            {isSidebarCollapsed ? (
              <IconChevronRight size={16} />
            ) : (
              <IconChevronLeft size={16} />
            )}
          </ActionIcon>
        </Box>

        <ScrollArea style={{ height: "calc(100vh - 260px)" }}>
          <Stack gap="xs">
            {organizations.map((org) => {
              const isActive = org.id === currentOrgId;
              const isExpanded = expandedOrgs.has(org.id);

              return (
                <OrgWithApps
                  key={org.id}
                  org={org}
                  isActive={isActive}
                  isCollapsed={!isExpanded}
                  isSidebarCollapsed={isSidebarCollapsed}
                  currentAppId={currentAppId}
                  userEmail={userEmail}
                  onToggle={() => toggleOrg(org.id)}
                />
              );
            })}
          </Stack>
        </ScrollArea>
      </Stack>

      {/* Collaborators Section at Bottom */}
      {onCollaboratorsClick && (
        <Box
          style={{
            paddingLeft: isSidebarCollapsed ? "8px" : "0",
            paddingTop: "12px",
            borderTop: "1px solid #e9ecef",
          }}
        >
          {isSidebarCollapsed ? (
            <Tooltip label="Collaborators" position="right" withArrow>
              <UnstyledButton
                onClick={onCollaboratorsClick}
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "12px",
                  transition: "all 150ms ease",
                  border: showCollaborators ? "2px solid #667eea" : "2px solid transparent",
                  padding: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: showCollaborators ? "rgba(103, 126, 234, 0.12)" : "transparent",
                }}
                styles={{
                  root: {
                    "&:hover": {
                      background: showCollaborators
                        ? "rgba(103, 126, 234, 0.12)"
                        : "rgba(103, 126, 234, 0.08)",
                    },
                  },
                }}
              >
                <Box
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: showCollaborators
                      ? "0 4px 12px rgba(103, 126, 234, 0.6)"
                      : "0 2px 8px rgba(103, 126, 234, 0.4)",
                  }}
                >
                  <IconUsers size={24} color="white" />
                </Box>
              </UnstyledButton>
            </Tooltip>
          ) : (
            <UnstyledButton
              onClick={onCollaboratorsClick}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                transition: "background-color 150ms ease",
                backgroundColor: showCollaborators
                  ? "rgba(103, 126, 234, 0.12)"
                  : "transparent",
                border: showCollaborators ? "2px solid #667eea" : "2px solid transparent",
              }}
              styles={{
                root: {
                  "&:hover": {
                    backgroundColor: showCollaborators
                      ? "rgba(103, 126, 234, 0.12)"
                      : "rgba(103, 126, 234, 0.08)",
                  },
                },
              }}
            >
              <Box style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Box
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(103, 126, 234, 0.4)",
                  }}
                >
                  <IconUsers size={20} color="white" />
                </Box>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    fw={showCollaborators ? 600 : 500}
                    size="sm"
                    c={showCollaborators ? "#667eea" : "gray.9"}
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Collaborators
                  </Text>
                  {showCollaborators && (
                    <Text size="xs" c="dimmed" mt={2}>
                      Manage team access
                    </Text>
                  )}
                </Box>
              </Box>
            </UnstyledButton>
          )}
        </Box>
      )}
    </Box>
  );
}
