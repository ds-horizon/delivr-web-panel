import {
  AppShell,
  Burger,
  Button,
  Code,
  Flex,
  Group,
  Image,
  rem,
} from "@mantine/core";
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { useMemo } from "react";
import { route } from "routes-gen";
import type { User } from "~/.server/services/Auth/Auth.interface";
import { Logo } from "~/components/Logo";
import { NavbarNested } from "~/components/NavbarNested";
import { SimpleTermsGuard } from "~/components/TermsAndConditions/SimpleTermsGuard";
import { authenticateLoaderRequest } from "~/utils/authenticate";
import cpIcon from './../assets/images/second.png';

export const loader = authenticateLoaderRequest();

export default function Dashboard() {
  const user = useLoaderData<User>();
  const navigate = useNavigate();
  const [opened, { toggle }] = useDisclosure();

  const openCreateApp = () => {
    navigate(route("/dashboard/create/app"));
  };
  useHotkeys([["C", openCreateApp]]);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Flex align={"center"} mt="sm">
          <Group h="100%" px="md" w={"100%"}>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Group justify="space-between">
              <Image src={cpIcon} alt="CodePush" fit="contain" height={44}/>
              <Logo style={{ width: rem(80) }} />
              {/* <Code fw={700}>v{config.version}</Code> */}
            </Group>
          </Group>
          <Group mr="sm">
            <Button
              onClick={openCreateApp}
              rightSection={<Code fw={700}>C</Code>}
            >
              App
            </Button>
          </Group>
        </Flex>
      </AppShell.Header>
      <AppShell.Navbar style={{ overflow: "hidden" }}>
        <NavbarNested user={user} />
      </AppShell.Navbar>
      <AppShell.Main>
        <SimpleTermsGuard>
          <Outlet />
        </SimpleTermsGuard>
      </AppShell.Main>
    </AppShell>
  );
}
