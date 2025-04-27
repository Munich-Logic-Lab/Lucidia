import { NextResponse } from "next/server";

import OpenAI from "openai";

// Create an OpenAI client instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = async (req: Request) => {
  try {
    const body = (await req.json()) as { prompt: string };
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Missing image prompt" },
        { status: 400 },
      );
    }

    // Call the OpenAI API to generate an image
    console.log("Generating image with prompt:", prompt);
    console.log(
      "Using OpenAI API key:",
      process.env.OPENAI_API_KEY ? "Key is set" : "Key is missing",
    );

    const response = await openai.images.generate({
      model: "dall-e-3", // Fall back to DALL-E 3 which is more widely available
      prompt: prompt,
      n: 1,
      size: "1024x1024", // Standard size
      quality: "standard",
    });

    // Extract the generated image URL from the response
    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error("No image URL returned from OpenAI");
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error generating image:", error);

    // Log more detailed error information
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      if ("code" in error) {
        console.error("Error code:", (error as any).code);
      }
    }

    return NextResponse.json(
      {
        error: "Failed to generate image",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
};
