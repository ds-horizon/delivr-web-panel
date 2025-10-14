import {
  AppShell,
  Flex,
  Group,
  Text,
} from "@mantine/core";
import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { route } from "routes-gen";
import type { User } from "~/.server/services/Auth/Auth.interface";
import { SimpleTermsGuard } from "~/components/TermsAndConditions/SimpleTermsGuard";
import { authenticateLoaderRequest } from "~/utils/authenticate";
import { HeaderUserButton } from "~/components/UserButton/HeaderUserButton";

export const loader = authenticateLoaderRequest();

export default function Dashboard() {
  const user = useLoaderData<User>();
  const navigate = useNavigate();

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderBottom: "none",
        }}
      >
        <Flex align={"center"} justify={"space-between"} h="100%" px="lg">
          <Group 
            gap="md" 
            style={{ cursor: "pointer" }} 
            onClick={() => navigate(route("/dashboard"))}
          >
            <Text 
              size="xl" 
              fw={700} 
              c="white"
              style={{
                fontSize: "24px",
                letterSpacing: "0.5px",
              }}
            >
              DOTA
            </Text>
          </Group>
          <HeaderUserButton user={user} />
        </Flex>
      </AppShell.Header>
      <AppShell.Main>
        <SimpleTermsGuard>
          <Outlet />
        </SimpleTermsGuard>
      </AppShell.Main>
    </AppShell>
  );
}
