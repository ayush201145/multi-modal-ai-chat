import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Model registry — all available models grouped by provider.
 */
export const MODEL_REGISTRY = {
  openai: {
    name: "OpenAI",
    envKey: "OPENAI_API_KEY",
    icon: "sparkles",
    color: "#10a37f",
    models: [
      { id: "gpt-4o", name: "GPT-4o", description: "Most capable model" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast & affordable" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Fast & cost-effective" },
    ],
  },
  anthropic: {
    name: "Anthropic",
    envKey: "ANTHROPIC_API_KEY",
    icon: "brain",
    color: "#d97706",
    models: [
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", description: "Best balance of speed & quality" },
      { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", description: "Fastest Claude model" },
      { id: "claude-3-opus-20240229", name: "Claude 3 Opus", description: "Most powerful Claude" },
    ],
  },
  google: {
    name: "Google Gemini",
    envKey: "GOOGLE_API_KEY",
    icon: "gem",
    color: "#4285f4",
    models: [
      { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash (Exp)", description: "Latest experimental model" },
      { id: "gemini-1.5-pro-latest", name: "Gemini 1.5 Pro", description: "Most capable Gemini" },
      { id: "gemini-1.5-flash-latest", name: "Gemini 1.5 Flash", description: "Fast & efficient" },
    ],
  },
  openrouter: {
    name: "OpenRouter",
    envKey: "OPENROUTER_API_KEY",
    icon: "route",
    color: "#6366f1",
    models: [
      { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", description: "Meta's flagship open model" },
      { id: "meta-llama/llama-3.1-70b-instruct", name: "Llama 3.1 70B", description: "Meta open model" },
      { id: "deepseek/deepseek-r1", name: "DeepSeek R1", description: "Open reasoning model" },
      { id: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5 72B", description: "Alibaba's flagship" },
      { id: "google/gemma-2-27b-it", name: "Gemma 2 27B", description: "Google open model" },
    ],
  },
};

/**
 * Get the list of available providers (only those with configured API keys).
 */
export function getAvailableProviders() {
  const available = {};

  for (const [key, provider] of Object.entries(MODEL_REGISTRY)) {
    const apiKey = process.env[provider.envKey];
    available[key] = {
      ...provider,
      available: !!apiKey,
      models: provider.models,
    };
  }

  return available;
}

/**
 * Create the AI SDK model instance for a given provider + model ID.
 */
export function getModelInstance(provider, modelId) {
  switch (provider) {
    case "openai": {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
      const openai = createOpenAI({ apiKey });
      return openai(modelId);
    }

    case "anthropic": {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
      const anthropic = createAnthropic({ apiKey });
      return anthropic(modelId);
    }

    case "google": {
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) throw new Error("GOOGLE_API_KEY is not configured");
      const google = createGoogleGenerativeAI({ apiKey });
      return google(modelId);
    }

    case "openrouter": {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");
      const openrouter = createOpenAI({
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
      });
      return openrouter(modelId);
    }

    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
