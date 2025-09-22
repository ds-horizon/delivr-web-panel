import {
  Button,
  Group,
  Text,
  Progress,
  Alert,
  ActionIcon,
  Loader,
  Badge,
  Stack,
  rem,
} from "@mantine/core";
import { IconFolder, IconInfoCircle, IconX, IconCheck } from "@tabler/icons-react";
import { useState, useRef, useCallback } from "react";
import JSZip from "jszip";

type DirectoryUploadState = 'idle' | 'selecting' | 'processing' | 'completed' | 'error';

interface DirectoryInfo {
  name: string;
  fileCount: number;
  files: FileList | null;
}

interface DirectoryUploadProps {
  onDirectorySelect: (zipBlob: Blob, directoryName: string) => void;
  disabled?: boolean;
  error?: string;
}

export function DirectoryUpload({ onDirectorySelect, disabled = false, error }: DirectoryUploadProps) {
  const directoryInputRef = useRef<HTMLInputElement>(null);
  
  // Directory upload state
  const [directoryUploadState, setDirectoryUploadState] = useState<DirectoryUploadState>('idle');
  const [directoryInfo, setDirectoryInfo] = useState<DirectoryInfo | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);

  const createZipFromFiles = async (files: FileList): Promise<Blob> => {
    const zip = new JSZip();
    
    // Process each file and maintain directory structure
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Use the webkitRelativePath to maintain directory structure
      const relativePath = file.webkitRelativePath || file.name;
      zip.file(relativePath, file);
      
      // Update progress
      const progress = Math.round(((i + 1) / files.length) * 50); // First 50% for adding files
      setProcessingProgress(progress);
    }
    
    // Generate ZIP with progress tracking
    return await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    }, (metadata) => {
      // Second 50% for ZIP generation
      const progress = 50 + Math.round((metadata.percent || 0) * 0.5);
      setProcessingProgress(progress);
    });
  };

  const handleDirectorySelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Get directory name from the first file's path
    const firstFile = files[0];
    const pathParts = firstFile.webkitRelativePath?.split('/') || [firstFile.name];
    const directoryName = pathParts[0] || 'bundle';

    // Set directory info and start processing
    setDirectoryInfo({
      name: directoryName,
      fileCount: files.length,
      files: files
    });
    setDirectoryUploadState('processing');
    setProcessingProgress(0);

    try {
      // Create ZIP from files
      const zipBlob = await createZipFromFiles(files);
      
      // Update state to completed
      setDirectoryUploadState('completed');
      setProcessingProgress(100);
      
      // Call the parent callback
      onDirectorySelect(zipBlob, directoryName);
    } catch (error) {
      console.error('Error creating ZIP:', error);
      setDirectoryUploadState('error');
    }
  }, [onDirectorySelect]);

  const handleCancelDirectory = useCallback(() => {
    // Reset all directory-related state
    setDirectoryInfo(null);
    setDirectoryUploadState('idle');
    setProcessingProgress(0);
    
    // Clear the file input
    if (directoryInputRef.current) {
      directoryInputRef.current.value = '';
    }
  }, []);

  return (
    <Stack gap="sm">
      <Alert icon={<IconInfoCircle />} color="blue" variant="light">
        <Text size="sm">
          <strong>Directory Upload:</strong> Select a directory containing your bundle files and assets.
          <br /><br />
          <strong>For single bundle files:</strong> Create a directory containing just your bundle file 
          (e.g., create a folder with <code>index.android.bundle</code> inside).
        </Text>
      </Alert>
      
      <div>
        <Text size="sm" fw={500} mb={5}>
          Bundle Directory <Text component="span" c="red">*</Text>
        </Text>
        <Text size="xs" c="dimmed" mb={10}>
          Select a directory containing your bundle file and any assets (required)
        </Text>
        
        {/* Directory Upload States */}
        {directoryUploadState === 'idle' && (
          <div style={{ position: 'relative' }}>
            <input
              ref={directoryInputRef}
              type="file"
              webkitdirectory=""
              multiple
              required
              onChange={handleDirectorySelect}
              disabled={disabled}
              style={{
                position: 'absolute',
                opacity: 0,
                width: '100%',
                height: '100%',
                cursor: 'pointer'
              }}
            />
            <Button
              variant="outline"
              leftSection={<IconFolder style={{ width: rem(16), height: rem(16) }} />}
              disabled={disabled}
              style={{ 
                width: '100%', 
                pointerEvents: 'none',
                borderColor: error ? 'var(--mantine-color-red-5)' : undefined
              }}
            >
              Choose Directory...
            </Button>
          </div>
        )}

        {/* Processing State */}
        {directoryUploadState === 'processing' && directoryInfo && (
          <div>
            <Group justify="space-between" mb="xs">
              <Group gap="sm">
                <Loader size="sm" />
                <div>
                  <Text size="sm" fw={500}>{directoryInfo.name}</Text>
                  <Text size="xs" c="dimmed">Processing {directoryInfo.fileCount} files...</Text>
                </div>
              </Group>
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={handleCancelDirectory}
                title="Cancel directory upload"
              >
                <IconX style={{ width: rem(16), height: rem(16) }} />
              </ActionIcon>
            </Group>
            <Progress value={processingProgress} animated />
          </div>
        )}

        {/* Completed State */}
        {directoryUploadState === 'completed' && directoryInfo && (
          <div>
            <Group justify="space-between" align="center">
              <Group gap="sm">
                <IconCheck style={{ width: rem(20), height: rem(20), color: 'var(--mantine-color-green-6)' }} />
                <div>
                  <Text size="sm" fw={500}>{directoryInfo.name}</Text>
                  <Badge size="xs" color="green" variant="light">
                    {directoryInfo.fileCount} files ready
                  </Badge>
                </div>
              </Group>
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={handleCancelDirectory}
                title="Remove directory"
              >
                <IconX style={{ width: rem(16), height: rem(16) }} />
              </ActionIcon>
            </Group>
          </div>
        )}

        {/* Error State */}
        {directoryUploadState === 'error' && (
          <div>
            <Alert color="red" variant="light" mb="sm">
              <Text size="sm">Failed to process directory. Please try again.</Text>
            </Alert>
            <Button
              variant="outline"
              leftSection={<IconFolder style={{ width: rem(16), height: rem(16) }} />}
              onClick={handleCancelDirectory}
              style={{ width: '100%' }}
            >
              Choose Different Directory
            </Button>
          </div>
        )}
        
        {error && directoryUploadState === 'idle' && (
          <Text size="xs" c="red" mt={5}>
            {error}
          </Text>
        )}
      </div>
    </Stack>
  );
}
