import {
  Box,
  Text,
  UnstyledButton,
  Stack,
  ScrollArea,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { useNavigate } from "@remix-run/react";
import { route } from "routes-gen";
import { useState } from "react";

type Organization = {
  id: string;
  orgName: string;
  isAdmin: boolean;
};

type OrgSwitcherProps = {
  organizations: Organization[];
  currentOrgId?: string;
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

export function OrgSwitcher({
  organizations,
  currentOrgId,
}: OrgSwitcherProps) {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Box
      style={{
        width: isCollapsed ? "80px" : "280px",
        height: "calc(100vh - 120px)",
        borderRight: "1px solid #e9ecef",
        paddingRight: isCollapsed ? "0" : "16px",
        transition: "width 200ms ease",
        position: "relative",
      }}
    >
      <Stack gap="xs" style={{ paddingLeft: isCollapsed ? "8px" : "0" }}>
        {/* Header with collapse button */}
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            marginBottom: "8px",
          }}
        >
          {!isCollapsed && (
            <Text size="sm" c="dimmed" fw={600} tt="uppercase">
              Organizations
            </Text>
          )}
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => setIsCollapsed(!isCollapsed)}
            size="sm"
          >
            {isCollapsed ? (
              <IconChevronRight size={16} />
            ) : (
              <IconChevronLeft size={16} />
            )}
          </ActionIcon>
        </Box>

        <ScrollArea style={{ height: "calc(100vh - 180px)" }}>
          <Stack gap="xs">
            {organizations.map((org) => {
              const isActive = org.id === currentOrgId;
              const colors = getOrgColor(org.orgName);
              const initials = getInitials(org.orgName);

              if (isCollapsed) {
                // Collapsed view - icon only
                return (
                  <Tooltip
                    key={org.id}
                    label={org.orgName}
                    position="right"
                    withArrow
                  >
                    <UnstyledButton
                      onClick={() => {
                        navigate(route("/dashboard/:org/apps", { org: org.id }));
                      }}
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "12px",
                        transition: "all 150ms ease",
                        border: isActive
                          ? "2px solid #667eea"
                          : "2px solid transparent",
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

              // Expanded view
              return (
                <UnstyledButton
                  key={org.id}
                  onClick={() => {
                    navigate(route("/dashboard/:org/apps", { org: org.id }));
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    transition: "background-color 150ms ease",
                    backgroundColor: isActive
                      ? "rgba(103, 126, 234, 0.12)"
                      : "transparent",
                    border: isActive
                      ? "2px solid #667eea"
                      : "2px solid transparent",
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
                      {isActive && (
                        <Text size="xs" c="dimmed" mt={2}>
                          Current organization
                        </Text>
                      )}
                    </Box>
                  </Box>
                </UnstyledButton>
              );
            })}
          </Stack>
        </ScrollArea>
      </Stack>
    </Box>
  );
}

