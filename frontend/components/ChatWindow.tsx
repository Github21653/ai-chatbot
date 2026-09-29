// "use client";
// import { useState, useRef, useEffect } from "react";
// import { ChatMessage, streamChat } from "@/lib/api";
// import MessageBubble from "./MessageBubble";
// import ChatInput from "./ChatInput";

// export default function ChatWindow() {
//   const [messages, setMessages] = useState<ChatMessage[]>([
//     { role: "assistant", content: "Hello! How can I help you today?" },
//   ]);
//   const [isStreaming, setIsStreaming] = useState(false);
//   const bottomRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSend = async (text: string) => {
//     const userMsg: ChatMessage = { role: "user", content: text };
//     const newMessages = [...messages, userMsg];
//     setMessages(newMessages);
//     setIsStreaming(true);

//     // Add a placeholder assistant message
//     setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

//     await streamChat(
//       newMessages,
//       (chunk) => {
//         setMessages((prev) => {
//           const updated = [...prev];
//           const last = updated[updated.length - 1];
//           updated[updated.length - 1] = {
//             ...last,
//             content: last.content + chunk,
//           };
//           return updated;
//         });
//       },
//       (err) => {
//         setMessages((prev) => [
//           ...prev.slice(0, -1),
//           { role: "assistant", content: `⚠️ ${err}` },
//         ]);
//       },
//       () => setIsStreaming(false)
//     );
//   };

//   return (
//     <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
//       <div className="flex-1 overflow-y-auto space-y-4 pb-4">
//         {messages.map((msg, i) => (
//           <MessageBubble key={i} message={msg} />
//         ))}
//         {isStreaming && (
//           <div className="text-sm text-gray-400 animate-pulse">Thinking…</div>
//         )}
//         <div ref={bottomRef} />
//       </div>
//       <ChatInput onSend={handleSend} disabled={isStreaming} />
//     </div>
//   );
// }


"use client";
import { useState, useRef, useEffect } from "react";
import { ChatMessage, streamChat } from "@/lib/api";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import ThemeToggle from "./ThemeToggle";
import { RobotIcon } from "./Icons";
import UserMenu from "./UserMenu";

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hello! How can I help you today?" },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string) => {
    const userMsg: ChatMessage = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages([...newMessages, { role: "assistant", content: "" }]);
    setIsStreaming(true);

    await streamChat(
      newMessages,
      (chunk) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = { ...last, content: last.content + chunk };
          return updated;
        });
      },
      (err) => {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: `⚠️ ${err}` },
        ]);
      },
      () => setIsStreaming(false)
    );
  };

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="flex items-center justify-between border-b
                   border-gray-200 bg-white/80 px-4 py-3 backdrop-blur
                   dark:border-gray-800 dark:bg-gray-950/80">
  <div className="flex items-center gap-2">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg
                    bg-blue-600 text-white">
      <RobotIcon className="h-5 w-5" />
    </div>
    <div>
      <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        AI Chatbot
      </h1>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Powered by OpenRouter
      </p>
    </div>
  </div>
  <div className="flex items-center gap-1">
    <ThemeToggle />
    <UserMenu />
  </div>
</header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <ChatInput onSend={handleSend} disabled={isStreaming} />
        </div>
      </div>
    </div>
  );
}