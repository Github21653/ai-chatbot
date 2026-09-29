export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
  }
  
  export async function streamChat(
    messages: ChatMessage[],
    onChunk: (text: string) => void,
    onError: (err: string) => void,
    onDone: () => void
  ) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    
    if (response.status === 401) {
      if (typeof window !== "undefined") window.location.href = "/login";
      return;
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      onError(err.detail || "Request failed");
      return;
    }
  
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
  
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
  
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || ""; // keep incomplete chunk
  
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);
        if (data === "[DONE]") {
          onDone();
          return;
        }
        try {
          const parsed = JSON.parse(data);
          if (parsed.content) onChunk(parsed.content);
          // if (parsed.error) onError(parsed.error);
          if (parsed.error) onError(parsed.code ? `${parsed.error} (${parsed.code})` : parsed.error);
        } catch {
          // ignore parse errors
        }
      }
    }
    onDone();
  }