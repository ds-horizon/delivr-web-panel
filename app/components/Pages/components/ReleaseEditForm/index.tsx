import { useForm } from "@mantine/form";
import {
  TextInput,
  Button,
  Group,
  Textarea,
  Modal,
  Switch,
  Slider,
  Text,
  Box,
  Flex,
  Tooltip,
} from "@mantine/core";
import { ReleaseListResponse } from "../ReleaseListForDeploymentTable/data/getReleaseListForDeployment";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { IconHelpOctagon } from "@tabler/icons-react";

type ReleaseEditProps = { data: ReleaseListResponse };

export function ReleaseEditFormModal({ data }: ReleaseEditProps) {
  const [serachParams] = useSearchParams();
  const navigate = useNavigate();
  const [rollout, setRollout] = useState(data.rollout);
  const form = useForm<ReleaseEditProps["data"]>({
    mode: "uncontrolled",
    initialValues: data,
    validateInputOnChange: true,
    validate: {
      description: (value) => {
        return value.length ? null : "Description Can't be Empty";
      },
    },
  });

  return (
    <Modal
      opened={
        !!serachParams.get("releaseId") &&
        !!serachParams.get("edit") &&
        serachParams.get("edit") === "true"
      }
      onClose={() => {
        navigate(-1);
      }}
      title="Edit Form"
      centered
      size={"xl"}
    >
      <TextInput
        label="Label"
        placeholder="Label"
        key={form.key("label")}
        {...form.getInputProps("label")}
        disabled
      />
      <Textarea
        mt="md"
        label="Description"
        placeholder="Description"
        key={form.key("description")}
        {...form.getInputProps("description")}
      />
      <Switch
        label="Status"
        {...form.getInputProps("status")}
        mt={"md"}
        style={{ width: "fit-content" }}
      />
      <Switch
        label="Mandatory"
        {...form.getInputProps("mandatory")}
        mt={"md"}
        style={{ width: "fit-content" }}
      />

      <Box mt={"md"}>
        <Flex align={"center"}>
          <Text size="md" style={{ cursor: "pointer" }} mr="sm">
            Rollout ({rollout}%)
          </Text>
          <Tooltip label={"Rollout Can't be Decreased"} color="blue" withArrow>
            <IconHelpOctagon size="1.05rem" stroke={1.5} />
          </Tooltip>
        </Flex>
        <Slider
          value={rollout}
          max={100}
          onChange={(value) => {
            if (value < data.rollout) {
              setRollout(data.rollout);
              return;
            }
            setRollout(value);
          }}
        />
      </Box>

      <Group justify="flex-end" mt="xl">
        <Button onClick={() => {}}>Submit</Button>
      </Group>
    </Modal>
  );
}
