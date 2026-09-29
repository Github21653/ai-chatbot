// "use client";
// import { useState, KeyboardEvent } from "react";

// export default function ChatInput({
//   onSend,
//   disabled,
// }: {
//   onSend: (text: string) => void;
//   disabled: boolean;
// }) {
//   const [text, setText] = useState("");

//   const handleSend = () => {
//     if (!text.trim() || disabled) return;
//     onSend(text.trim());
//     setText("");
//   };

//   const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   return (
//     <div className="flex gap-2 border-t pt-4">
//       <textarea
//         className="flex-1 resize-none rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//         rows={2}
//         placeholder="Type your message…"
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         onKeyDown={handleKey}
//         disabled={disabled}
//       />
//       <button
//         onClick={handleSend}
//         disabled={disabled || !text.trim()}
//         className="rounded-xl bg-blue-600 px-5 text-white font-medium disabled:opacity-50 hover:bg-blue-700 transition"
//       >
//         Send
//       </button>
//     </div>
//   );
// }

"use client";
import { useState, KeyboardEvent } from "react";

export default function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText("");
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
      <div className="flex items-end gap-2">
        <textarea
          className="flex-1 resize-none rounded-xl border border-gray-300
                     bg-white px-3 py-2.5 text-sm text-gray-900
                     placeholder:text-gray-400
                     focus:border-blue-500 focus:outline-none focus:ring-2
                     focus:ring-blue-500/30
                     disabled:opacity-50
                     dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100
                     dark:placeholder:text-gray-500 dark:focus:border-blue-400"
          rows={2}
          placeholder="Type your message… (Enter to send, Shift+Enter for newline)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          disabled={disabled}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white
                     transition hover:bg-blue-700
                     disabled:cursor-not-allowed disabled:opacity-50
                     dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Send
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
        Responses may be inaccurate. Do not share sensitive information.
      </p>
    </div>
  );
}