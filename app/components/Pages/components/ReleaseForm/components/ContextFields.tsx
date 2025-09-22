import { Group, TextInput } from "@mantine/core";
import { useParams } from "@remix-run/react";
import { useGetOrgList } from "../../OrgListNavbar/hooks/useGetOrgList";

export function ContextFields() {
  const params = useParams();
  
  // Get organization list to resolve org name
  const { data: orgs = [] } = useGetOrgList();
  const currentOrg = orgs.find(org => org.id === params.org);
  const orgName = currentOrg?.orgName || params.org || '';

  return (
    <Group grow>
      <TextInput
        label="Organization"
        value={orgName}
        readOnly
        styles={{
          input: {
            cursor: 'default',
            color: 'var(--mantine-color-dimmed)',
          },
        }}
      />
      <TextInput
        label="Application"
        value={params.app || ''}
        readOnly
        styles={{
          input: {
            cursor: 'default',
            color: 'var(--mantine-color-dimmed)',
          },
        }}
      />
    </Group>
  );
}
