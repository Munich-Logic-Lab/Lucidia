import { z } from "zod";

// define the expected response schema for the OpenAI realtime session
const OpenaiRealtimeSessionResponse = z
  .object({
    id: z.string(),
    url: z.string().url(),
    expires_at: z.string().datetime(),
    client_secret: z.object({
      value: z.string(),
    }),
  })
  .or(
    z.object({
      error: z.object({
        message: z.string(),
        type: z.string().optional(),
        code: z.string().optional(),
      }),
      details: z.any().optional(),
    }),
  );

export const Route = {
  name: "ApiOpenaiRealtimeSession",
  params: z.object({}),
  response: OpenaiRealtimeSessionResponse,
};
