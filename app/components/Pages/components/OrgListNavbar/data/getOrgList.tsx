import { mockApiData } from "~/utils/mockApiData";

type Organization = {
  id: string;
  orgName: string;
  isAdmin: boolean;
};

const data: Organization[] = [
  {
    id: "1",
    orgName: "TechCorp",
    isAdmin: true,
  },
  {
    id: "2",
    orgName: "InnovateX",
    isAdmin: false,
  },
  {
    id: "3",
    orgName: "CodeMaster",
    isAdmin: true,
  },
  {
    id: "4",
    orgName: "DevSolutions",
    isAdmin: false,
  },
];

export const getOrgList = mockApiData(data);
