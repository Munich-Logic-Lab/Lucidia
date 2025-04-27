"use client";

import { useEffect, useRef, useState } from "react";

import { RIcon, RecordbuttonIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useDreamRealtime } from "@/hooks/use-dream-realtime";

const INSTRUCTIONS =
  "You are a dream interpreter AI. When the user describes their dream, help them understand what it might mean. Ask thoughtful follow-up questions about emotional elements, recurring symbols, or connections to their current life. Focus on being insightful rather than generic. But first let the user talk about their dream and only ask short and preciese questions in order to gather the story of their dream.";

export function DreamRecorder() {
  const [dreamText, setDreamText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

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
    if (aiMessage) {
      setAiResponse((prev) => prev + aiMessage);
      setIsProcessing(false);
    }
  }, [aiMessage]);

  const handleMicrophoneToggle = async () => {
    if (!isConnected) {
      try {
        setIsProcessing(true);

        await connect({
          instructions: INSTRUCTIONS,
          voice: "shimmer",
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
          instructions: INSTRUCTIONS,
          voice: "shimmer",
        });
      }

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
            Dream Interpretation
          </h3>
          <p className="text-sm">{aiResponse}</p>
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
        {isRecording && !isProcessing && "Listening to your dream..."}
        {isConnected &&
          !isProcessing &&
          !isRecording &&
          "Connected to dream interpreter"}
        {!isConnected && !isProcessing && "Press the microphone to start"}
      </div>
    </div>
  );
}
