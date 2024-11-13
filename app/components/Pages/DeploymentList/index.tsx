"use client";
import {
  ActionIcon,
  Box,
  Card,
  CopyButton,
  Flex,
  rem,
  Skeleton,
  Text,
  Tooltip,
} from "@mantine/core";
import { useSearchParams } from "@remix-run/react";
import { DeploymentsSearch } from "../components/DeploymentsSearch";
import { useGetDeploymentsForApp } from "../components/DeploymentsSearch/hooks/getDeploymentsForApp";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { ReleaseListForDeploymentTable } from "../components/ReleaseListForDeploymentTable";
import { ReleaseDeatilCardModal } from "../components/ReleaseDeatilCardModal";
import { useEffect } from "react";

export const DeploymentList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading } = useGetDeploymentsForApp();

  const details = data?.find(
    (item) => item.name === searchParams.get("deployment")
  );

  useEffect(() => {
    if (!searchParams.get("deployment")) {
      if (data) {
        setSearchParams((p) => {
          p.set("deployment", data?.[0].name ?? "Production");
          return p;
        });
      }
    }
  }, [data, searchParams, setSearchParams]);

  return (
    <>
      <Flex justify={"space-between"} align={"center"}>
        {details && !isLoading ? (
          <Card
            withBorder
            radius="md"
            padding="sm"
            bg="var(--mantine-color-body)"
          >
            <Flex align={"center"}>
              <Text fz="md" tt="uppercase" fw={700}>
                {details?.name}
              </Text>
              <CopyButton value={details.deploymentKey} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip
                    label={
                      copied
                        ? "Copied"
                        : `Copy Deployment Key (${details.deploymentKey})`
                    }
                    withArrow
                    position="right"
                    color={copied ? "teal" : "blue"}
                  >
                    <ActionIcon
                      color={copied ? "teal" : "gray"}
                      variant="subtle"
                      onClick={copy}
                      ml={"sm"}
                    >
                      {copied ? (
                        <IconCheck style={{ width: rem(16) }} />
                      ) : (
                        <IconCopy style={{ width: rem(16) }} />
                      )}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Flex>
          </Card>
        ) : (
          <Skeleton h={50} w={170} />
        )}
        <DeploymentsSearch />
      </Flex>
      <ReleaseListForDeploymentTable />
      <Box h={"50vh"} w={"40vw"}>
        <ReleaseDeatilCardModal
          id={searchParams.get("releaseId")}
          opened={!!searchParams.get("releaseId")}
          close={() => {
            setSearchParams((p) => {
              p.delete("releaseId");
              return p;
            });
          }}
          deploymentName={details?.name}
        />
      </Box>
    </>
  );
};
