import { z } from "zod";

// Define the expected request and response schema for generate-image-prompt API
const GenerateImagePromptRequest = z.object({
  instructions: z.string(),
  conversation: z.string(),
});

const GenerateImagePromptResponse = z
  .object({
    prompt: z.string(),
  })
  .or(
    z.object({
      error: z.string(),
    }),
  );

export const Route = {
  name: "ApiOpenaiGenerateImagePrompt",
  params: z.object({}),
  request: GenerateImagePromptRequest,
  response: GenerateImagePromptResponse,
};
