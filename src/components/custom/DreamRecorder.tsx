"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { RIcon, RecordbuttonIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useDreamRealtime } from "@/hooks/use-dream-realtime";

// Updated instructions to no longer ask for the hidden image prompt
const REALTIME_INSTRUCTIONS =
  "You are a dream scene constructor AI. Start by asking the user to tell you about their dream. Then, ask 2-3 short, specific questions to gather more details about the visual elements, setting, characters, and emotions in their dream. Based on their responses, construct a detailed mental image of their dream scene. Once you have enough information, tell the user: 'Thank you for sharing your dream. I've gathered enough details to create an image based on the scene you described. The image will appear shortly. Our session will end now, but you can start a new conversation anytime.'";

// Separate instruction for image prompt generation via standard API
const IMAGE_PROMPT_INSTRUCTIONS =
  "Create a detailed image generation prompt based on the following dream description. The prompt should be visually rich, descriptive, and capture the essence of the dream. Include visual details about setting, characters, mood, lighting, and style. Make it suitable for an AI image generator.";

export function DreamRecorder() {
  const [dreamText, setDreamText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [completeConversation, setCompleteConversation] = useState<string>("");
  const [shouldGenerateImagePrompt, setShouldGenerateImagePrompt] =
    useState(false);

  // Custom debug log function that both logs to console and stores for UI
  const debugLog = useCallback(
    (message: string, data?: Record<string, unknown>) => {
      const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
      const logMsg = `${timestamp} - ${message}`;
      console.log(logMsg, data);
      setDebugLogs((prev) => [...prev.slice(-9), logMsg]); // Keep last 10 logs
    },
    [],
  );

  // Use our custom hook for WebRTC integration
  const {
    connect,
    disconnect,
    toggleMute,
    isMuted,
    connectionStatus,
    transcription,
    aiMessage,
    sendMessage,
  } = useDreamRealtime();

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Effect to handle connection status changes
  useEffect(() => {
    console.log("Connection status changed:", connectionStatus);
    setIsConnected(connectionStatus === "connected");
  }, [connectionStatus]);

  // Effect to update transcription
  useEffect(() => {
    if (transcription) {
      setDreamText(transcription);
    }
  }, [transcription]);

  // Effect to handle AI responses
  useEffect(() => {
    debugLog("AI message effect triggered", {
      messageLength: aiMessage?.length || 0,
    });

    if (aiMessage) {
      debugLog("Processing AI message", {
        firstChars: aiMessage.substring(0, 50),
      });

      // Add to the complete conversation for later use in image prompt generation
      setCompleteConversation((prev) => prev + "\n\nAI: " + aiMessage);

      // Check if this is the first message or a new part
      const isNewMessage = !aiResponse.includes(aiMessage);

      // Add AI response to display, only if it's not already there
      if (isNewMessage) {
        setAiResponse((prev) => prev + aiMessage);
      }

      // Look for trigger phrases that indicate conclusion message
      // Using multiple checks to ensure reliable detection even with small variations
      const finalPhrases = [
        "Thank you for sharing your dream",
        "gathered enough details",
        "image will appear shortly",
        "create an image",
        "session will end now",
      ];

      // Check if at least 2 of the phrases are present to increase reliability
      const finalPhraseMatches = finalPhrases.filter((phrase) =>
        aiMessage.toLowerCase().includes(phrase.toLowerCase()),
      );

      const isFinalMessage = finalPhraseMatches.length >= 2;

      debugLog("Checking for final message", {
        isFinalMessage,
        matchedPhrases: finalPhraseMatches,
        messageExcerpt: aiMessage.substring(0, 100),
      });

      // Check if this message contains the final goodbye message
      if (isFinalMessage) {
        debugLog("Final message detected - will generate image prompt");

        // Set flag to generate image prompt after conversation ends
        setShouldGenerateImagePrompt(true);

        // Wait for the AI to finish its final message before disconnecting
        setTimeout(() => {
          if (isConnected) {
            debugLog("Disconnecting after final message");
            disconnect();
            setIsRecording(false);
            setIsConnected(false);
          }
        }, 5000); // Give the AI 5 seconds to finish its goodbye message
      }

      setIsProcessing(false);
    }
  }, [aiMessage, disconnect, isConnected, aiResponse, debugLog]);

  // Define generateImage function first
  const generateImage = useCallback(
    async (prompt: string) => {
      if (!prompt) {
        debugLog("Cannot generate image - prompt is empty");
        return;
      }

      try {
        if (isGeneratingImage) return;

        setIsGeneratingImage(true);
        debugLog("Starting image generation", { promptLength: prompt.length });

        // Notify parent that image generation has started
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("dreamImageGenerationStart"));
        }

        // Use the OpenAI GPT image generation API
        debugLog("Calling OpenAI image generation API with gpt-image-1 model");

        // Call our API endpoint that will use OpenAI's image generation
        const response = await fetch("/api/openai/generate-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to generate image: ${response.status} ${response.statusText}`,
          );
        }

        // Get the URL of the generated image
        const data = (await response.json()) as { imageUrl?: string };

        if (!data?.imageUrl) {
          throw new Error("No image URL returned from API");
        }

        const imageUrl = data.imageUrl;

        debugLog("Image generation successful", { imageUrl });
        setGeneratedImageUrl(imageUrl);

        // Notify parent component about the generated image
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("dreamImageGenerated", {
              detail: { imageUrl },
            }),
          );
        }
      } catch (error) {
        debugLog("Image generation error", {
          error: error instanceof Error ? error.message : String(error),
        });
        console.error("Image generation error:", error);
      } finally {
        setIsGeneratingImage(false);
        setIsProcessing(false);

        // Notify parent that image generation has ended
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("dreamImageGenerationEnd"));
        }
      }
    },
    [debugLog],
  );

  // Effect to handle image prompt generation after conversation ends
  useEffect(() => {
    const generateImagePrompt = async () => {
      if (!shouldGenerateImagePrompt || !completeConversation) {
        debugLog("Skipping image prompt generation", {
          shouldGenerateImagePrompt,
          conversationLength: completeConversation.length,
        });
        return;
      }

      try {
        debugLog("Generating image prompt from conversation", {
          conversationPreview: completeConversation.substring(0, 100) + "...",
        });

        if (isProcessing) return;

        setIsProcessing(true);

        // Call standard ChatGPT API to generate image prompt
        const response = await fetch("/api/openai/generate-image-prompt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            instructions: IMAGE_PROMPT_INSTRUCTIONS,
            conversation: completeConversation,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to generate image prompt: ${response.status} ${response.statusText}`,
          );
        }

        const data = (await response.json()) as { prompt?: string };

        if (!data?.prompt) {
          throw new Error(
            "Invalid response format from image prompt generation API",
          );
        }

        const prompt = data.prompt;

        debugLog("Generated image prompt successfully", {
          promptLength: prompt.length,
          promptPreview: prompt.substring(0, 50) + "...",
        });

        setImagePrompt(prompt);

        // Now that we have the prompt, generate the image
        await generateImage(prompt);
      } catch (error) {
        debugLog("Image prompt generation error", {
          error: error instanceof Error ? error.message : String(error),
        });
        console.error("Image prompt generation error:", error);
        setIsProcessing(false);
      } finally {
        setShouldGenerateImagePrompt(false);
      }
    };

    generateImagePrompt().catch((error) => {
      console.error("Unhandled error in generateImagePrompt:", error);
      setIsProcessing(false);
    });
  }, [
    shouldGenerateImagePrompt,
    completeConversation,
    generateImage,
    debugLog,
  ]);

  /* The generateImage function is defined earlier in the file */

  const handleMicrophoneToggle = async () => {
    if (!isConnected) {
      try {
        // Reset state when starting a new session
        setAiResponse("");
        setImagePrompt("");
        setDreamText("");
        setGeneratedImageUrl("");
        setIsProcessing(true);
        setCompleteConversation(""); // Reset conversation history
        setShouldGenerateImagePrompt(false);

        // Notify parent component to reset the image display
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("dreamImageReset"));
        }

        await connect({
          instructions: REALTIME_INSTRUCTIONS,
          voice: "shimmer",
          model: "gpt-4o-realtime-preview-2024-12-17",
        });

        setIsProcessing(false);
        setIsRecording(true);
      } catch (error) {
        console.error("Connection error:", error);
        setIsProcessing(false);
      }
      return;
    }

    // If already connected, toggle mute
    const newMuteState = toggleMute();
    setIsRecording(!newMuteState);
  };

  const handleSendText = async () => {
    if (!dreamText.trim()) return;

    try {
      setIsProcessing(true);

      if (!isConnected) {
        await connect({
          instructions: REALTIME_INSTRUCTIONS,
          voice: "shimmer",
          model: "gpt-4o-realtime-preview-2024-12-17",
        });
      }

      // Add to conversation history
      setCompleteConversation((prev) => prev + "\n\nUser: " + dreamText);

      // Make sure microphone is muted when sending text
      if (!isMuted && isConnected) {
        toggleMute();
        setIsRecording(false);
      }

      await sendMessage(dreamText);
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsProcessing(false);
    }
  };

  const handleDisconnect = () => {
    // Make sure to completely disconnect
    disconnect();
    setIsRecording(false);
    setIsConnected(false);
    setAiResponse("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <RIcon className="h-6 w-6 translate-y-[-4px]" />
          <h2 className="translate-x-[-4px] text-[18px] leading-[22px] font-normal tracking-[0.72px]">
            ecord your dream
          </h2>
        </div>
        {isConnected && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            disabled={isProcessing}
          >
            Disconnect
          </Button>
        )}
      </div>

      <div className="mb-4 grow">
        <Textarea
          ref={textareaRef}
          placeholder="Write or speak about your dream..."
          className="min-h-[150px] w-full resize-none rounded-md border p-3"
          value={dreamText}
          onChange={(e) => setDreamText(e.target.value)}
          disabled={isProcessing}
        />
      </div>

      {aiResponse && (
        <div className="mb-4 rounded-md bg-purple-50 p-3">
          <h3 className="mb-1 text-sm font-medium text-purple-700">
            Dream Scene Construction
          </h3>
          <p className="text-sm">{aiResponse}</p>
        </div>
      )}

      {isGeneratingImage && (
        <div className="mb-4 rounded-md bg-blue-50 p-3">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-medium text-blue-700">
            Creating Dream Image
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></span>
          </h3>
          <p className="text-sm">
            Converting your dream description into an image...
          </p>
        </div>
      )}

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={handleMicrophoneToggle}
          disabled={isProcessing}
          aria-label={isRecording ? "Pause recording" : "Start recording"}
        >
          <RecordbuttonIcon className="hover:red-100" />
        </button>
        {/* TODO: text deactivated for now */}
        {/*
        <Button
          className="rounded-md bg-blue-500 px-4 py-2 hover:bg-blue-600"
          onClick={handleSendText}
          disabled={!dreamText.trim() || isProcessing || isRecording}
        >
          <Send className="mr-1 h-5 w-5" />
          Interpret Dream
        </Button>
        */}
      </div>

      <div className="text-muted-foreground text-center text-sm">
        {isProcessing && "Processing..."}
        {isGeneratingImage && "Generating dream image..."}
        {isRecording &&
          !isProcessing &&
          !isGeneratingImage &&
          "Listening to your dream..."}
        {isConnected &&
          !isProcessing &&
          !isRecording &&
          !isGeneratingImage &&
          "Connected to dream scene constructor"}
        {!isConnected &&
          !isProcessing &&
          !isGeneratingImage &&
          "Press the microphone to start"}
      </div>

      {/* Debug Log Display - Only shown during development */}
      <div className="mt-4 border-t pt-4 font-mono text-xs text-gray-500">
        <details>
          <summary className="cursor-pointer font-semibold">
            Debug Logs ({debugLogs.length})
          </summary>
          <div className="mt-2 rounded bg-gray-100 p-2">
            {debugLogs.length === 0 ? (
              <p>No logs yet</p>
            ) : (
              <ul className="max-h-40 space-y-1 overflow-y-auto">
                {debugLogs.map((log, index) => (
                  <li key={index} className="whitespace-pre-wrap">
                    {log}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => {
                  debugLog("Requesting AI message content...");
                  if (aiMessage) {
                    debugLog("Full AI message", { content: aiMessage });
                  } else {
                    debugLog("No AI message available");
                  }
                }}
                className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
              >
                Debug AI Message
              </button>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
