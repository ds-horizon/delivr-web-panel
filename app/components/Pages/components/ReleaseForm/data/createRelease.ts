import axios, { AxiosResponse } from "axios";

export interface CreateReleaseRequest {
  orgName: string;
  appName: string;
  deploymentName: string;
  formData: FormData;
  onProgress?: (progress: number) => void;
}

export interface CreateReleaseResponse {
  package: {
    label: string;
    appVersion: string;
    description: string;
    packageHash: string;
    blobUrl: string;
    size: number;
    rollout: number;
    isMandatory: boolean;
    isDisabled: boolean;
    uploadTime: number;
  };
}

export const createRelease = async ({
  orgName,
  appName,
  deploymentName,
  formData,
  onProgress,
}: CreateReleaseRequest): Promise<CreateReleaseResponse> => {
  const appIdentifier = `${orgName}/${appName}`;
  
  const { data } = await axios.post<CreateReleaseResponse>(
    `/api/v1/${appIdentifier}/deployments/${deploymentName}/release`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress(progress);
        }
      },
    }
  );

  return data;
};
