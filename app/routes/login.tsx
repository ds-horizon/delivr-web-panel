import { Text, Paper, Group, PaperProps, Stack, Center } from "@mantine/core";
import { GoogleButton } from "~/components/GoogleButton";
import { useSubmit } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { AuthenticatorService } from "~/.server/services/Auth/Auth";
import { LoginForm } from "~/components/Pages/Login";

export const loader = ({ request }: LoaderFunctionArgs) => {
  return AuthenticatorService.isLoggedIn(request);
};

export default function AuthenticationForm() {
  const submit = useSubmit();

  const login = () => {
    submit(null, {
      method: "post",
      action: `/auth/google`,
    });
  };

  return (
    <Center style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Paper
        radius="md"
        p="xl"
        withBorder
        shadow="md"
        style={{ width: "100%", maxWidth: 400 }}
        {...props}
      >
        <Stack spacing="lg" align="center">
          <Text size="xl" fw={700} align="center">
            Welcome to Codepush
          </Text>
          <Text size="sm" color="dimmed" align="center">
            Instantly manage your app updates with ease.
          </Text>
          <Group grow mb="md" mt="md">
            <GoogleButton radius="xl" fullWidth onClick={login}>
              Continue with Google
            </GoogleButton>
          </Group>
        </Stack>
      </Paper>
    </Center>
  );
}
