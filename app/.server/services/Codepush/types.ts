type Organization = {
  id: string;
  displayName: string;
  role: "Owner" | "Collabarator";
};

export type TenantsResponse = {
  organisations: Organization[];
};

export type TenantsRequest = {
  userId: string;
};
