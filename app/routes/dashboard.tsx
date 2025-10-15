import {
  Flex,
  Group,
  Text,
  Box,
  Skeleton,
} from "@mantine/core";
import { IconRocket } from "@tabler/icons-react";
import { Outlet, useLoaderData, useNavigate, useParams, useLocation } from "@remix-run/react";
import { route } from "routes-gen";
import type { User } from "~/.server/services/Auth/Auth.interface";
import { SimpleTermsGuard } from "~/components/TermsAndConditions/SimpleTermsGuard";
import { authenticateLoaderRequest } from "~/utils/authenticate";
import { HeaderUserButton } from "~/components/UserButton/HeaderUserButton";
import { CombinedSidebar } from "~/components/Pages/components/AppDetailPage/components/CombinedSidebar";
import { useGetOrgList } from "~/components/Pages/components/OrgListNavbar/hooks/useGetOrgList";

export const loader = authenticateLoaderRequest();

export default function Dashboard() {
  const user = useLoaderData<User>();
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const { data: orgs = [], isLoading: orgsLoading } = useGetOrgList();

  // Check if we're on the main dashboard page (organizations list)
  const isMainDashboard = location.pathname === "/dashboard";
  // Show sidebar if we have orgs AND we're not on main dashboard
  const showSidebar = orgs.length > 0 && !isMainDashboard;

  return (
    <SimpleTermsGuard>
      {orgsLoading ? (
        <Flex h="100vh" direction="column">
          <Skeleton height={60} width="100%" />
          <Flex style={{ flex: 1 }}>
            <Skeleton width={280} height="100%" />
            <Box style={{ flex: 1 }} p="md">
              <Skeleton height={40} width="100%" mb="md" />
              <Skeleton height={400} width="100%" />
            </Box>
          </Flex>
        </Flex>
      ) : (
        <Flex h="100vh" direction="column">
          {/* Common Header with Linear Gradient */}
          <Box
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              borderBottom: "none",
              paddingTop: "1rem",
              paddingBottom: "1rem",
            }}
          >
            <Flex align="center" justify="space-between" h="100%" px="lg">
              <Group 
                gap="sm" 
                style={{ cursor: "pointer" }} 
                onClick={() => navigate(route("/dashboard"))}
              >
                <IconRocket size={32} color="white" stroke={2} />
                <Text 
                  size="xl" 
                  fw={700} 
                  c="white"
                  style={{
                    fontSize: "24px",
                    letterSpacing: "0.5px",
                  }}
                >
                  Delivr
                </Text>
              </Group>
              <HeaderUserButton user={user} />
            </Flex>
          </Box>

          {/* Content Area - with or without sidebar */}
          <Flex style={{ flex: 1, overflow: "hidden" }}>
            {showSidebar && (
              <CombinedSidebar
                organizations={orgs}
                currentOrgId={params.org}
                currentAppId={params.app}
                userEmail={user.user.email}
              />
            )}
            <Box style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              <Outlet />
            </Box>
          </Flex>
        </Flex>
      )}
    </SimpleTermsGuard>
  );
}
