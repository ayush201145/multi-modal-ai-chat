import { streamText } from "ai";
import { authenticateRequest } from "@/lib/auth";
import { getModelInstance } from "@/lib/ai-providers";
import { classifyError } from "@/lib/errors";

export const maxDuration = 60;

export async function POST(request) {
  // Authenticate
  const auth = authenticateRequest(request);
  if (!auth.valid) {
    return Response.json(
      { error: { title: "Unauthorized", message: auth.error } },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { messages, provider, model: modelId } = body;

    // Validate required fields
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: { title: "Invalid Request", message: "Messages array is required." } },
        { status: 400 }
      );
    }

    if (!provider || !modelId) {
      return Response.json(
        { error: { title: "Invalid Request", message: "Provider and model are required." } },
        { status: 400 }
      );
    }

    // Get AI model instance
    let modelInstance;
    try {
      modelInstance = getModelInstance(provider, modelId);
    } catch (err) {
      return Response.json(
        {
          error: {
            title: "Provider Not Configured",
            message: err.message || "The selected AI provider is not properly configured.",
          },
        },
        { status: 503 }
      );
    }

    // Stream the response
    const result = streamText({
      model: modelInstance,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    // Stream the response safely across AI SDK versions
    if (typeof result.toDataStreamResponse === "function") {
      return result.toDataStreamResponse();
    }
    if (typeof result.toTextStreamResponse === "function") {
      return result.toTextStreamResponse();
    }
    return new Response(result.textStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Chat error:", error);

    const classified = classifyError(error);
    return Response.json(
      {
        error: {
          title: classified.title,
          message: classified.message,
          detail: classified.detail,
        },
      },
      { status: classified.status }
    );
  }
}
