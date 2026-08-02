import { generateText } from "ai";
import { authenticateRequest } from "@/lib/auth";
import { MODEL_REGISTRY, getModelInstance } from "@/lib/ai-providers";

export async function GET(request) {
  const auth = authenticateRequest(request);
  if (!auth.valid) {
    return Response.json(
      { error: { title: "Unauthorized", message: auth.error } },
      { status: 401 }
    );
  }

  const results = {};

  for (const [providerKey, providerInfo] of Object.entries(MODEL_REGISTRY)) {
    const apiKey = process.env[providerInfo.envKey];
    if (!apiKey) {
      results[providerKey] = {
        name: providerInfo.name,
        status: "missing_key",
        message: `${providerInfo.envKey} is not set in .env`,
        testedModels: [],
      };
      continue;
    }

    const testedModels = [];

    for (const model of providerInfo.models) {
      try {
        const modelInstance = getModelInstance(providerKey, model.id);
        // Ping model with 1 token test
        await generateText({
          model: modelInstance,
          prompt: "hi",
          maxTokens: 1,
        });

        testedModels.push({
          id: model.id,
          name: model.name,
          status: "working",
          message: "Active & Working",
        });
      } catch (err) {
        testedModels.push({
          id: model.id,
          name: model.name,
          status: "error",
          message: err.message || "Failed to call model",
        });
      }
    }

    const anyWorking = testedModels.some((m) => m.status === "working");
    results[providerKey] = {
      name: providerInfo.name,
      status: anyWorking ? "active" : "key_error",
      testedModels,
    };
  }

  return Response.json({ keyDiagnostics: results });
}
