import { Button, Group, Progress, Text, rem } from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";

interface ReleaseFormActionsProps {
  isUploading: boolean;
  isProcessing: boolean;
  uploadProgress: number;
  hasDirectory: boolean;
}

export function ReleaseFormActions({ 
  isUploading, 
  isProcessing, 
  uploadProgress, 
  hasDirectory 
}: ReleaseFormActionsProps) {
  const isDisabled = isUploading || isProcessing || !hasDirectory;
  
  return (
    <>
      {/* Upload Progress */}
      {isUploading && (
        <div>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500}>Uploading Release...</Text>
            <Text size="sm" c="dimmed">{Math.round(uploadProgress)}%</Text>
          </Group>
          <Progress value={uploadProgress} animated />
        </div>
      )}

      {/* Submit Button */}
      <Group justify="flex-end">
        <Button
          type="submit"
          leftSection={<IconUpload style={{ width: rem(16), height: rem(16) }} />}
          loading={isUploading}
          disabled={isDisabled}
          size="md"
        >
          {isUploading ? "Creating Release..." : "Create Release"}
        </Button>
      </Group>
    </>
  );
}
