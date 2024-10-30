import { Paper, Title, Group } from "@mantine/core";
import classes from "./index.module.css";
import { GoogleButton } from "~/components/GoogleButton";

type LoginProps = {
  onClickLogin: () => void;
};

export function LoginForm({ onClickLogin }: LoginProps) {
  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form} radius={0} p={30}>
        <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
          Welcome back to Codepush!
        </Title>

        <Group grow mb="md">
          <GoogleButton radius="xl" onClick={onClickLogin}>
            Google
          </GoogleButton>
        </Group>
      </Paper>
    </div>
  );
}
