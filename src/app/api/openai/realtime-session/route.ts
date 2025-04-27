import { type NextRequest, NextResponse } from "next/server";

import env from "@/env";

// create an ephemeral token to use on the client-side
// https://platform.openai.com/docs/guides/realtime#creating-an-ephemeral-token
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: "shimmer",
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        { error: "Failed to create OpenAI session", details: errorData },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating OpenAI session:", error);
    return NextResponse.json(
      { error: "Failed to create session", details: String(error) },
      { status: 500 },
    );
  }
}
