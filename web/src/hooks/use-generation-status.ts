"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface GenerationMetadata {
  id: string;
  timestamp: string;
  prompt: string;
  status: string;
  image_status?: string;
  image_url?: string;
  ply_status?: string;
  ply_url?: string;
  ply_path?: string;
  error?: string;
  storage?: {
    provider: string;
    url: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface UseGenerationStatusOptions {
  metadataUrl?: string;
  pollingInterval?: number;
  onComplete?: (metadata: GenerationMetadata) => void;
  onImageComplete?: (imageUrl: string) => void;
  onPlyComplete?: (plyUrl: string) => void;
  onError?: (error: Error) => void;
}

export function useGenerationStatus({
  metadataUrl,
  pollingInterval = 2000,
  onComplete,
  onImageComplete,
  onPlyComplete,
  onError,
}: UseGenerationStatusOptions) {
  const [metadata, setMetadata] = useState<GenerationMetadata | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use refs to keep track of whether we've already triggered the callbacks
  const imageCompletedRef = useRef(false);
  const plyCompletedRef = useRef(false);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const checkMetadata = useCallback(async () => {
    if (!metadataUrl) return;

    try {
      const response = await fetch(metadataUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch metadata: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as GenerationMetadata;
      setMetadata(data);

      // Check for image completion
      if (
        data.image_url &&
        data.image_status === "completed" &&
        !imageCompletedRef.current
      ) {
        imageCompletedRef.current = true;
        onImageComplete?.(data.image_url);
      }

      // Check for PLY completion
      if (
        data.ply_url &&
        data.ply_status === "completed" &&
        !plyCompletedRef.current
      ) {
        plyCompletedRef.current = true;
        onPlyComplete?.(data.ply_url);
      }

      // Check for overall completion
      if (data.status === "completed") {
        onComplete?.(data);
        stopPolling();
      } else if (data.status === "failed") {
        throw new Error(`Generation failed: ${data.error || "Unknown error"}`);
      } else {
        // Continue polling
        pollingTimeoutRef.current = setTimeout(() => {
          void checkMetadata();
        }, pollingInterval);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      stopPolling();
    }
  }, [
    metadataUrl,
    onComplete,
    onImageComplete,
    onPlyComplete,
    onError,
    stopPolling,
    pollingInterval,
  ]);

  // Start polling when metadataUrl changes
  useEffect(() => {
    if (metadataUrl) {
      // Reset state
      setMetadata(null);
      setError(null);
      imageCompletedRef.current = false;
      plyCompletedRef.current = false;

      setIsPolling(true);

      // Use setTimeout with 0 delay to avoid potential infinite update loops
      // This ensures the checkMetadata call is made in the next event loop tick
      const initialPoll = setTimeout(() => {
        void checkMetadata();
      }, 0);

      return () => {
        clearTimeout(initialPoll);
        stopPolling();
      };
    }
  }, [metadataUrl, checkMetadata, stopPolling]);

  return { metadata, isPolling, error };
}
