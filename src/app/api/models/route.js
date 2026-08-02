import { authenticateRequest } from "@/lib/auth";
import { getAvailableProviders } from "@/lib/ai-providers";

export async function GET(request) {
  const auth = authenticateRequest(request);
  if (!auth.valid) {
    return Response.json(
      { error: { title: "Unauthorized", message: auth.error } },
      { status: 401 }
    );
  }

  try {
    const providers = getAvailableProviders();
    return Response.json({ providers });
  } catch (error) {
    console.error("Models error:", error);
    return Response.json(
      { error: { title: "Server Error", message: "Failed to fetch available models." } },
      { status: 500 }
    );
  }
}
