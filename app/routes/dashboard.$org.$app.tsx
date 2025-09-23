import { rem, Tabs } from "@mantine/core";
import { IconPhoto, IconSettings, IconRocket } from "@tabler/icons-react";
import { CollabaratorList } from "~/components/Pages/components/CollaboratorList";
import { DeploymentList } from "~/components/Pages/DeploymentList";
import { ReleaseForm } from "~/components/Pages/components/ReleaseForm/ReleaseForm";

export default function AppDetails() {
  const iconStyle = { width: rem(12), height: rem(12) };
  return (
    <Tabs defaultValue="Deployments">
      <Tabs.List>
        <Tabs.Tab
          value="Deployments"
          leftSection={<IconPhoto style={iconStyle} />}
        >
          Deployments
        </Tabs.Tab>
            <Tabs.Tab
              value="Release"
              leftSection={<IconRocket style={iconStyle} />}
            >
              Release
            </Tabs.Tab>
        <Tabs.Tab
          value="Collaborators"
          leftSection={<IconSettings style={iconStyle} />}
        >
          Collaborators
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="Deployments" mt={"md"}>
        <DeploymentList />
      </Tabs.Panel>
      <Tabs.Panel value="Release" mt={"md"}>
        <ReleaseForm />
      </Tabs.Panel>
      <Tabs.Panel value="Collaborators" mt={"md"}>
        <CollabaratorList />
      </Tabs.Panel>
    </Tabs>
  );
}
