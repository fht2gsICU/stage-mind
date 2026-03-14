/**
 * API client — all fetch calls go through here.
 * Base URL from NEXT_PUBLIC_API_URL env var.
 */
import type { APIResponse, ParsedWorld } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<APIResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    return { data: null, error: text || `HTTP ${res.status}` };
  }
  return res.json() as Promise<APIResponse<T>>;
}

export const api = {
  /** POST /api/v1/story/parse — submit story text, get back ParsedWorld */
  parseStory: (text: string, experience_type = "solo") =>
    request<ParsedWorld>("/api/v1/story/parse", {
      method: "POST",
      body: JSON.stringify({ text, experience_type }),
    }),

  /** GET /api/v1/story/:id — fetch a previously parsed world */
  getWorld: (id: string) => request<ParsedWorld>(`/api/v1/story/${id}`),

  /** POST /api/v1/branch/:nodeId/choose — trigger a branch choice */
  chooseBranch: (nodeId: string, choiceId: string) =>
    request<{ narrative: string; unlocked_scene_id: string | null }>(
      `/api/v1/branch/${nodeId}/choose`,
      { method: "POST", body: JSON.stringify({ choice_id: choiceId }) }
    ),
};

/** SSE helper for streaming character dialogue */
export function streamDialogue(
  storyId: string,
  characterId: string,
  userMessage: string,
  onChunk: (chunk: string) => void,
  onDone: () => void
): AbortController {
  const ctrl = new AbortController();
  const url = `${BASE_URL}/api/v1/dialogue/${storyId}/${characterId}`;

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({ message: userMessage }),
    signal: ctrl.signal,
  }).then(async (res) => {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      // SSE lines: "data: <text>\n\n"
      for (const line of chunk.split("\n")) {
        if (line.startsWith("data: ")) onChunk(line.slice(6));
      }
    }
    onDone();
  });

  return ctrl;
}
