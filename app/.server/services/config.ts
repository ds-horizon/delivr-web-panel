enum EnvArgs {
  GITHUB_TOKEN = "GITHUB_TOKEN",
  GITHUB_OWNER = "GITHUB_OWNER",
  GITHUB_REPO = "GITHUB_REPO",
  GITHUB_WEBHOOK_SECRET = "GITHUB_WEBHOOK_SECRET",
  GITHUB_SENDER_LOGIN = "GITHUB_SENDER_LOGIN",
  SLACK_TOKEN = "SLACK_TOKEN",
  GOOGLE_CLIENT_ID = "GOOGLE_CLIENT_ID",
  GOOGLE_CLIENT_SECRET = "GOOGLE_CLIENT_SECRET",
  AWS_S3_BUCKET = "AWS_S3_BUCKET",
  aws_secret_access_key = "aws_secret_access_key",
  aws_access_key_id = "aws_access_key_id",
  DELIVR_BACKEND_URL = "DELIVR_BACKEND_URL",
  NODE_ENV = "NODE_ENV",
  OAUTH_TEST_MODE = "OAUTH_TEST_MODE",
}

type TEnv = Record<EnvArgs, string> & {
  NODE_ENV?: string;
  OAUTH_TEST_MODE?: string;
};

const initialValue: TEnv = {
  [EnvArgs.GITHUB_TOKEN]: "",
  [EnvArgs.GITHUB_OWNER]: "",
  [EnvArgs.GITHUB_REPO]: "",
  [EnvArgs.GITHUB_WEBHOOK_SECRET]: "",
  [EnvArgs.GITHUB_SENDER_LOGIN]: "",
  [EnvArgs.SLACK_TOKEN]: "",
  [EnvArgs.GOOGLE_CLIENT_ID]: "",
  [EnvArgs.GOOGLE_CLIENT_SECRET]: "",
  [EnvArgs.AWS_S3_BUCKET]: "",
  [EnvArgs.aws_secret_access_key]: "",
  [EnvArgs.aws_access_key_id]: "",
  [EnvArgs.DELIVR_BACKEND_URL]: "",
  [EnvArgs.NODE_ENV]: "",
  [EnvArgs.OAUTH_TEST_MODE]: "",
};

const makeConfig = (): TEnv => {
  let initial = "";
  if (process.env.DEPLOYMENT === "production") {
    initial = "VAULT_SERVICE_";
  }

  const config = Object.keys(EnvArgs).reduce((prev, curr) => {
    // NODE_ENV and OAUTH_TEST_MODE don't use vault prefix
    if (curr === 'NODE_ENV' || curr === 'OAUTH_TEST_MODE') {
      return { ...prev, [curr]: process.env[curr] ?? "" };
    }
    return { ...prev, [curr]: process.env[`${initial}${curr}`] ?? "" };
  }, initialValue);
  
  // Ensure NODE_ENV and OAUTH_TEST_MODE are always read directly
  return {
    ...config,
    NODE_ENV: process.env.NODE_ENV,
    OAUTH_TEST_MODE: process.env.OAUTH_TEST_MODE,
  };
};

export const env: TEnv = makeConfig();
