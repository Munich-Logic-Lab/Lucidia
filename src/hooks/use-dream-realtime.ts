"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Define types
export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "failed";

export interface RealtimeConfig {
  instructions?: string;
  voice?:
    | "alloy"
    | "echo"
    | "fable"
    | "onyx"
    | "nova"
    | "shimmer"
    | "ash"
    | "ballad"
    | "coral"
    | "sage"
    | "verse";
  model?: string;
}

export function useDreamRealtime() {
  // State
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [transcription, setTranscription] = useState<string>("");
  const [aiMessage, setAiMessage] = useState<string>("");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  // Refs to hold WebRTC objects
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const ephemeralKeyRef = useRef<string>("");

  // Clean up function
  const cleanup = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
      document.body.removeChild(audioElementRef.current);
      audioElementRef.current = null;
    }

    setConnectionStatus("disconnected");
    ephemeralKeyRef.current = "";
    setTranscription("");
    setAiMessage("");
  }, []);

  // Disconnect function
  const disconnect = useCallback(() => {
    cleanup();
  }, [cleanup]);

  // Effect to clean up on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Connect to OpenAI Realtime API
  const connect = useCallback(
    async (config?: RealtimeConfig) => {
      try {
        // Clean up any existing connections
        cleanup();

        setConnectionStatus("connecting");

        // Get ephemeral key from our backend
        const tokenResponse = await fetch("/api/openai/realtime-session");
        if (!tokenResponse.ok) {
          throw new Error(
            `Failed to get session token: ${tokenResponse.status}`,
          );
        }

        const data = await tokenResponse.json();
        ephemeralKeyRef.current = data.client_secret.value;

        // Step 1: Get microphone access FIRST
        console.log("Requesting microphone access...");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaStreamRef.current = stream;

        // Step 2: Create a peer connection
        const pc = new RTCPeerConnection();
        peerConnectionRef.current = pc;

        // Step 3: Set up audio element for playback
        const audioEl = document.createElement("audio");
        audioEl.autoplay = true;
        document.body.appendChild(audioEl);
        audioElementRef.current = audioEl;

        // Step 4: Handle incoming audio tracks
        pc.ontrack = (e) => {
          if (audioElementRef.current) {
            audioElementRef.current.srcObject = e.streams[0];
          }
        };

        // Step 5: Add audio track to peer connection
        stream.getAudioTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Step 6: Set up data channel for events
        const dc = pc.createDataChannel("oai-events");
        dataChannelRef.current = dc;

        // Handle incoming messages
        dc.addEventListener("message", (e) => {
          try {
            const eventData = JSON.parse(e.data);
            console.log("Received event:", eventData);

            // Handle transcription updates
            if (
              eventData.type === "conversation.item.input_audio_transcription"
            ) {
              setTranscription(eventData.content.text);
            }

            // Handle AI responses
            if (
              eventData.role === "assistant" &&
              eventData.content &&
              eventData.content.trim()
            ) {
              setAiMessage(eventData.content);
            }
          } catch (error) {
            console.error("Error processing message:", error);
          }
        });

        // Handle data channel state changes
        dc.addEventListener("open", () => {
          console.log("Data channel open");
          setConnectionStatus("connected");

          // Set up configuration on channel open
          if (config) {
            const sessionConfig: Record<string, any> = {};

            if (config.instructions) {
              sessionConfig.instructions = config.instructions;
            }

            if (config.voice) {
              sessionConfig.voice = config.voice;
            }

            if (config.model) {
              sessionConfig.model = config.model;
            } else {
              sessionConfig.model = "gpt-4o-realtime-preview-2024-12-17";
            }

            // Configure session with server VAD (Voice Activity Detection)
            dc.send(
              JSON.stringify({
                type: "session.update",
                session: {
                  ...sessionConfig,
                  input_audio_transcription: {
                    model: "whisper-1",
                  },
                  turn_detection: {
                    type: "server_vad", // This is key - let the server handle voice detection
                  },
                },
              }),
            );
          }
        });

        dc.addEventListener("close", () => {
          console.log("Data channel closed");
          setConnectionStatus("disconnected");
        });

        // Create and set local description
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Send the offer to OpenAI and get answer
        const baseUrl = "https://api.openai.com/v1/realtime";
        const model = config?.model || "gpt-4o-realtime-preview-2024-12-17";

        const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
          method: "POST",
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${ephemeralKeyRef.current}`,
            "Content-Type": "application/sdp",
          },
        });

        if (!sdpResponse.ok) {
          throw new Error(
            `SDP request failed: ${sdpResponse.status} ${sdpResponse.statusText}`,
          );
        }

        const sdpText = await sdpResponse.text();

        // Set the remote description
        const answer = {
          type: "answer",
          sdp: sdpText,
        };

        await pc.setRemoteDescription(answer as RTCSessionDescriptionInit);

        console.log("WebRTC connection established");
        return true;
      } catch (error) {
        console.error("Connection error:", error);
        cleanup();
        setConnectionStatus("failed");
        throw error;
      }
    },
    [cleanup],
  );

  // Start recording - with server VAD, we toggle the audio tracks
  const startRecording = useCallback(async () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = true;
      });
      setIsMuted(false);
      console.log("Microphone enabled");
    }
    return true;
  }, []);

  // Stop recording - mute the microphone tracks
  const stopRecording = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
      setIsMuted(true);
      console.log("Microphone muted");
    }
  }, []);

  // Toggle mute state
  const toggleMute = useCallback(() => {
    if (isMuted) {
      startRecording();
    } else {
      stopRecording();
    }
    return !isMuted;
  }, [isMuted, startRecording, stopRecording]);

  // Send text message
  const sendMessage = useCallback(
    async (message: string) => {
      try {
        if (connectionStatus !== "connected" || !dataChannelRef.current) {
          throw new Error("Not connected to OpenAI Realtime API");
        }

        // Clear previous AI message
        setAiMessage("");

        // Format and send the message
        const payload = {
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [
              {
                type: "text",
                text: message,
              },
            ],
          },
        };

        dataChannelRef.current.send(JSON.stringify(payload));
        console.log("Message sent:", message);
        return true;
      } catch (error) {
        console.error("Send message error:", error);
        throw error;
      }
    },
    [connectionStatus],
  );

  return {
    connect,
    disconnect,
    startRecording,
    stopRecording,
    toggleMute,
    sendMessage,
    connectionStatus,
    transcription,
    aiMessage,
    isMuted,
  };
}
