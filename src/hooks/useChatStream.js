"use client";
import { useState, useCallback, useRef } from "react";

/**
 * Custom streaming chat hook.
 * Handles message streaming from /api/chat with abort support.
 */
export function useChatStream({ token, onError }) {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(null);

  const sendMessage = useCallback(
    async (messages, provider, model) => {
      setIsStreaming(true);
      abortRef.current = new AbortController();

      let assistantMessage = "";

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messages, provider, model }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          let errorData;
          try {
            errorData = await res.json();
          } catch {
            errorData = { error: { title: "Error", message: `Request failed with status ${res.status}` } };
          }
          const errorInfo = errorData?.error || { title: "Error", message: "Unknown error" };
          onError?.(errorInfo);
          setIsStreaming(false);
          return null;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          onError?.({ title: "Error", message: "No response stream available" });
          setIsStreaming(false);
          return null;
        }

        const decoder = new TextDecoder();
        let isDataStream = false;
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          
          if (!isDataStream && (chunk.startsWith("0:") || chunk.includes("\n0:"))) {
            isDataStream = true;
          }

          if (isDataStream) {
            buffer += chunk;
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("0:")) {
                try {
                  const text = JSON.parse(line.slice(2));
                  assistantMessage += text;
                } catch {}
              } else if (line.startsWith("3:")) {
                try {
                  const errorText = JSON.parse(line.slice(2));
                  onError?.({ title: "Stream Error", message: errorText });
                } catch {}
              }
            }
          } else {
            assistantMessage += chunk;
          }
        }

        setIsStreaming(false);
        return assistantMessage;
      } catch (err) {
        if (err.name === "AbortError") {
          setIsStreaming(false);
          return assistantMessage || null;
        }
        onError?.({
          title: "Network Error",
          message: "Connection lost. Please check your internet and try again.",
        });
        setIsStreaming(false);
        return null;
      }
    },
    [token, onError]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { sendMessage, stopStreaming, isStreaming };
}
