import { Text, Paper, Group, PaperProps } from "@mantine/core";
import { GoogleButton } from "~/components/GoogleButton";
import { useSubmit } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { AuthenticatorService } from "~/.server/services/Auth/Auth";

export const loader = ({ request }: LoaderFunctionArgs) => {
  return AuthenticatorService.isLoggedIn(request);
};

export default function AuthenticationForm(props: PaperProps) {
  const submit = useSubmit();

  const login = () => {
    submit(null, {
      method: "post",
      action: `/auth/google`,
    });
  };

  return (
    <Paper radius="md" p="xl" withBorder {...props}>
      <Text size="lg" fw={500}>
        Welcome to Codepush, Login with
      </Text>
      <Group grow mb="md" mt="md">
        <GoogleButton radius="xl" onClick={login}>
          Google
        </GoogleButton>
      </Group>
    </Paper>
  );
}
