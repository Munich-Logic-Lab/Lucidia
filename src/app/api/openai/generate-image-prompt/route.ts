import { NextResponse } from "next/server";

import OpenAI from "openai";

// Create an OpenAI client instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { instructions, conversation } = body as {
      instructions: string;
      conversation: string;
    };

    if (!conversation) {
      return NextResponse.json(
        { error: "Missing conversation content" },
        { status: 400 },
      );
    }

    // Construct the prompt for image generation
    const prompt = `${instructions}\n\nHere is the dream conversation between a user and AI:\n\n${conversation}\n\nBased on this conversation, create a detailed image generation prompt:`;

    // Call the OpenAI API to generate an image prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-05-13", // Or your preferred model
      messages: [
        {
          role: "system",
          content:
            "You are an expert at creating detailed image generation prompts based on dream descriptions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Extract the generated prompt from the response
    const generatedPrompt = response.choices[0].message.content || "";

    return NextResponse.json({ prompt: generatedPrompt });
  } catch (error) {
    console.error("Error generating image prompt:", error);
    return NextResponse.json(
      { error: "Failed to generate image prompt" },
      { status: 500 },
    );
  }
};
