import {
  Box,
  Text,
  UnstyledButton,
  Stack,
  ScrollArea,
  Button,
} from "@mantine/core";
import {
  IconPlus,
  IconBuilding,
  IconAppWindow,
} from "@tabler/icons-react";
import { useNavigate } from "@remix-run/react";
import { route } from "routes-gen";
import { useGetAppListForOrg } from "../../AppList/hooks/useGetAppListForOrg";
import { backgrounds, text, borders } from "~/theme";

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
};


// Component for each organization with its apps
function OrgWithApps({
  org,
  isActive,
  currentAppId,
  userEmail,
}: {
  org: Organization;
  isActive: boolean;
  currentAppId?: string;
  userEmail: string;
}) {
  const navigate = useNavigate();

  const { data: apps = [], isLoading } = useGetAppListForOrg({
    orgId: org.id,
    userEmail: userEmail,
  });

  return (
    <Box>
      {/* Organization Header */}
      <UnstyledButton
        onClick={() => {
          navigate(route("/dashboard/:org/apps", { org: org.id }));
        }}
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: "12px",
          transition: "all 150ms ease",
          background: isActive
            ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
            : "transparent",
          border: "1px solid transparent",
        }}
        styles={{
          root: {
            "&:hover": {
              background: isActive
                ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                : backgrounds.hover,
            },
          },
        }}
      >
        <Box style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <IconBuilding 
            size={20} 
            color={isActive ? "white" : text.secondary}
            stroke={1.5}
          />
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text
              fw={600}
              size="md"
              c={isActive ? "white" : text.secondary}
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {org.orgName}
            </Text>
          </Box>
        </Box>
      </UnstyledButton>

      {/* Apps List - Always Visible */}
      <Box style={{ paddingLeft: "20px", marginTop: "12px" }}>
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
                    borderRadius: "8px",
                    transition: "all 150ms ease",
                    backgroundColor: isAppActive
                      ? "#eef2ff"
                      : "transparent",
                    borderLeft: isAppActive
                      ? `3px solid #6366f1`
                      : "3px solid transparent",
                  }}
                  styles={{
                    root: {
                      "&:hover": {
                        backgroundColor: isAppActive
                          ? "#eef2ff"
                          : backgrounds.hover,
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
                    <IconAppWindow 
                      size={16} 
                      color={isAppActive ? "#6366f1" : text.secondary}
                      stroke={1.5}
                    />
                    <Text
                      fw={isAppActive ? 600 : 500}
                      size="sm"
                      c={isAppActive ? "#4f46e5" : text.secondary}
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
    </Box>
  );
}

export function CombinedSidebar({
  organizations,
  currentOrgId,
  currentAppId,
  userEmail,
}: CombinedSidebarProps) {
  const navigate = useNavigate();

  return (
    <Box
      style={{
        width: "280px",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background: backgrounds.tertiary,
        borderRight: `1px solid ${borders.primary}`,
      }}
    >
      {/* Navigation Content */}
      <Box
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          paddingRight: "16px",
        }}
      >
        <Stack gap="xs" style={{ paddingLeft: "16px", paddingTop: "16px", flex: 1 }}>
          <ScrollArea style={{ height: "calc(100vh - 160px)" }}>
            <Text
              size="xs"
              fw={700}
              c={text.disabled}
              style={{
                letterSpacing: "1px",
                marginTop: "8px",
                marginBottom: "16px",
                paddingLeft: "16px",
              }}
            >
              ORGANIZATIONS
            </Text>
            <Stack gap="xs">
              {organizations.map((org) => {
                const isActive = org.id === currentOrgId;

                return (
                  <OrgWithApps
                    key={org.id}
                    org={org}
                    isActive={isActive}
                    currentAppId={currentAppId}
                    userEmail={userEmail}
                  />
                );
              })}
            </Stack>
          </ScrollArea>
        </Stack>

        {/* Create Organization Button */}
        <Box
          style={{
            paddingLeft: "16px",
            paddingTop: "12px",
            paddingBottom: "16px",
            borderTop: `1px solid ${borders.primary}`,
          }}
        >
          <Button
            fullWidth
            leftSection={<IconPlus size={18} />}
            onClick={() => navigate(route("/dashboard/create/org"))}
            variant="gradient"
            gradient={{ from: "#6366f1", to: "#8b5cf6", deg: 135 }}
            styles={{
              root: {
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                transition: "all 200ms ease",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(99, 102, 241, 0.4)",
                  transform: "translateY(-1px)",
                },
              },
            }}
          >
            Create Organization
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
