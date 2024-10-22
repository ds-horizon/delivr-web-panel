import { mockApiData } from "~/utils/mockApiData";

enum PLATFORM {
  "ANDROID" = "ANDROID",
  "IOS" = "IOS",
}

type AppCardResponse = {
  id: string;
  name: string;
  link: string;
  description: string;
  platform: PLATFORM;
  metrics: {
    numberOfDeployments: number;
    numberOfReleases: number;
  };
};

const data: AppCardResponse[] = [
  {
    id: "app-001",
    name: "CodePush Dashboard",
    link: "https://codepush-dashboard.com",
    description: "A dashboard to manage CodePush deployments and releases.",
    platform: PLATFORM.ANDROID,
    metrics: {
      numberOfDeployments: 42,
      numberOfReleases: 8,
    },
  },
  {
    id: "app-002",
    name: "Deployment Tracker",
    link: "https://deployment-tracker.com",
    description: "Track and monitor your app deployments in real-time.",
    platform: PLATFORM.IOS,
    metrics: {
      numberOfDeployments: 15,
      numberOfReleases: 4,
    },
  },
  {
    id: "app-003",
    name: "Release Manager",
    link: "https://release-manager.com",
    description: "Manage releases and rollout strategies efficiently.",
    platform: PLATFORM.ANDROID,
    metrics: {
      numberOfDeployments: 67,
      numberOfReleases: 10,
    },
  },
  {
    id: "app-004",
    name: "Metrics Hub",
    link: "https://metrics-hub.com",
    description:
      "Comprehensive insights into app performance and user engagement.",
    platform: PLATFORM.IOS,
    metrics: {
      numberOfDeployments: 23,
      numberOfReleases: 5,
    },
  },
  {
    id: "app-005",
    name: "App Insights",
    link: "https://app-insights.com",
    description:
      "Gain visibility into your app’s performance and user metrics.",
    platform: PLATFORM.ANDROID,
    metrics: {
      numberOfDeployments: 50,
      numberOfReleases: 12,
    },
  },
  {
    id: "app-006",
    name: "Version Control",
    link: "https://version-control.com",
    description: "Control app versions and manage seamless rollbacks.",
    platform: PLATFORM.IOS,
    metrics: {
      numberOfDeployments: 30,
      numberOfReleases: 6,
    },
  },
  {
    id: "app-007",
    name: "User Engagement Pro",
    link: "https://user-engagement-pro.com",
    description: "Maximize user engagement with targeted updates.",
    platform: PLATFORM.ANDROID,
    metrics: {
      numberOfDeployments: 80,
      numberOfReleases: 14,
    },
  },
  {
    id: "app-008",
    name: "Update Monitor",
    link: "https://update-monitor.com",
    description: "Monitor app updates and feedback in real time.",
    platform: PLATFORM.IOS,
    metrics: {
      numberOfDeployments: 20,
      numberOfReleases: 3,
    },
  },
  {
    id: "app-009",
    name: "AppStream",
    link: "https://appstream.com",
    description: "Deliver continuous updates to ensure smooth app performance.",
    platform: PLATFORM.ANDROID,
    metrics: {
      numberOfDeployments: 90,
      numberOfReleases: 18,
    },
  },
  {
    id: "app-010",
    name: "DeployPro",
    link: "https://deploypro.com",
    description:
      "A one-stop solution for managing large-scale app deployments.",
    platform: PLATFORM.IOS,
    metrics: {
      numberOfDeployments: 35,
      numberOfReleases: 7,
    },
  },
];

export const getAppListForOrg = mockApiData(data);
