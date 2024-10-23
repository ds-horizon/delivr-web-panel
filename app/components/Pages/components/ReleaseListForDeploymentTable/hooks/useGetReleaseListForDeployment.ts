import { useQuery } from "react-query";
import { getReleaseListForDeployment } from "../data/getReleaseListForDeployment";

export const useGetReleaseListForDeployment = (deploymentId: string) => {
  return useQuery(
    [`${deploymentId}-deployment-list`], // Use an array for the query key
    () => getReleaseListForDeployment(), // Call the function with the deploymentId
    {
      refetchOnWindowFocus: false,
    }
  );
};
