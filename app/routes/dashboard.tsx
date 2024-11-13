"use client";
import { AppShell, Burger, Code, Group, rem } from "@mantine/core";
import { NavbarNested } from "~/components/NavbarNested";
import { useDisclosure } from "@mantine/hooks";
import { Logo } from "~/components/Logo";
import { Outlet, useLoaderData } from "@remix-run/react";
import { authenticateLoaderRequest } from "~/utils/authenticate";
import { User } from "~/.server/services/Auth/Auth.interface";

export const loader = authenticateLoaderRequest();

export default function Hello() {
  const data = useLoaderData<User>();
  const [opened, { toggle }] = useDisclosure();
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <div>
            <Group justify="space-between">
              <Logo style={{ width: rem(120) }} />
              <Code fw={700}>v1.0.0</Code>
            </Group>
          </div>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar style={{ overflow: "hidden" }}>
        <NavbarNested user={data} />
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
