import { UnstyledButton, Group, Avatar, Text, rem, Menu } from "@mantine/core";
import { IconChevronRight, IconLogout } from "@tabler/icons-react";
import classes from "./index.module.css";
import { Form } from "@remix-run/react"; // Use Remix's Form for logout action

export function UserButton() {
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton className={classes.user}>
          <Group>
            <Avatar
              src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png"
              radius="xl"
            />
            <div style={{ flex: 1 }}>
              <Text size="sm" fw={500}>
                Harriette Spoonlicker
              </Text>
              <Text c="dimmed" size="xs">
                hspoonlicker@outlook.com
              </Text>
            </div>
            <IconChevronRight
              style={{ width: rem(14), height: rem(14) }}
              stroke={1.5}
            />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item color="red">
          <Form method="post" action="/logout" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconLogout size={14} /> {/* Render the icon directly here */}
            <button type="submit" style={{ all: 'unset', cursor: 'pointer', flex: 1, textAlign: 'left' }}>
              Logout
            </button>
          </Form>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}