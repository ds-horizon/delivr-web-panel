import {
  getReleaseListForDeployment,
  ReleaseListResponse,
} from "../../ReleaseListForDeploymentTable/data/getReleaseListForDeployment";

export const getReleaseDataForDeployment = async (
  id: string
): Promise<ReleaseListResponse | undefined> => {
  const data = await getReleaseListForDeployment();
  return data.filter((item) => item.id === id)[0];
};
