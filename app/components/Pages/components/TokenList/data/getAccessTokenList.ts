import { mockApiData } from "~/utils/mockApiData";

export type AccessToken = {
  id: string;
  name: string;
  role: "READ" | "WRITE";
};

const data: AccessToken[] = [
  {
    id: "1a2b3c4d",
    name: "User One",
    role: "READ",
  },
  {
    id: "2b3c4d5e",
    name: "User Two",
    role: "WRITE",
  },
  {
    id: "3c4d5e6f",
    name: "User Three",
    role: "READ",
  },
  {
    id: "4d5e6f7g",
    name: "User Four",
    role: "WRITE",
  },
];

export const getAccessTokenList = mockApiData(data);
