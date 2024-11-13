import { useQuery } from "react-query";
import { getAppListForOrg } from "../data/getAppListForOrg";

export const useGetAppListForOrg = (id: string) => {
  return useQuery(`appList-for-${id}`, () => getAppListForOrg(id));
};
