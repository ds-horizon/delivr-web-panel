import { UnstyledButton, Avatar, Menu, rem } from "@mantine/core";
import {
  IconLogout,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";
import { Form, useNavigate } from "@remix-run/react";
import { User } from "~/.server/services/Auth/Auth.interface";
import { route } from "routes-gen";

export type HeaderUserButtonProps = {
  user: User;
};

export function HeaderUserButton({ user }: HeaderUserButtonProps) {
  const navigate = useNavigate();
  
  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <UnstyledButton>
          <Avatar 
            name={user.user.name} 
            radius="xl" 
            size="md"
            style={{ cursor: "pointer" }}
          />
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{user.user.name}</Menu.Label>
        <Menu.Label style={{ fontWeight: 400, fontSize: '0.75rem' }}>
          {user.user.email}
        </Menu.Label>
        <Menu.Divider />
        <Menu.Item
          leftSection={
            <IconSettings style={{ width: rem(14), height: rem(14) }} />
          }
          onClick={() => {
            navigate(route("/dashboard/tokens"));
          }}
        >
          Token List
        </Menu.Item>
        <Menu.Item
          color="red"
          leftSection={
            <IconTrash style={{ width: rem(14), height: rem(14) }} />
          }
          onClick={() => {
            navigate(route("/dashboard/delete") + "?type=Profile");
          }}
        >
          Delete Account
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item color="red">
          <Form
            method="post"
            action="/logout"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <IconLogout size={14} />
            <button
              type="submit"
              style={{
                all: "unset",
                cursor: "pointer",
                flex: 1,
                textAlign: "left",
              }}
            >
              Logout
            </button>
          </Form>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

