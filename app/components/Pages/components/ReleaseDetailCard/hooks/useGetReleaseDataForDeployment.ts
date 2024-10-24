import { useQuery } from "react-query";
import { getReleaseDataForDeployment } from "../data/getReleaseDataForDeployment";

export const useGetReleaseDataForDeployment = (releaseId: string) => {
  return useQuery(
    [`${releaseId}-deployment-list`], // Use an array for the query key
    () => getReleaseDataForDeployment(releaseId), // Call the function with the deploymentId
    {
      refetchOnWindowFocus: false,
    }
  );
};
