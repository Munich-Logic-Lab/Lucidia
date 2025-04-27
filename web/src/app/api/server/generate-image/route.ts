import { NextResponse } from "next/server";

// Define the server URL
const SERVER_URL = process.env.LUCIDIA_SERVER_URL || "http://localhost:5000";

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

    console.log("Sending prompt to Lucidia server:", prompt);

    // Call the Lucidia server API to generate the image and PLY
    const response = await fetch(`${SERVER_URL}/generate-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (!data.metadata_url) {
      throw new Error("No metadata URL returned from server");
    }

    // Return the metadata information from the server
    return NextResponse.json({
      success: true,
      id: data.id,
      metadataUrl: data.metadata_url,
      expectedImageUrl: data.expected_image_url,
      expectedPlyUrl: data.expected_ply_url,
      status: data.status,
    });
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
