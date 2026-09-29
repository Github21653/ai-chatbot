// import { ChatMessage } from "@/lib/api";

// export default function MessageBubble({ message }: { message: ChatMessage }) {
//   const isUser = message.role === "user";
//   return (
//     <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
//       <div
//         className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
//           isUser
//             ? "bg-blue-600 text-white rounded-br-md"
//             : "bg-gray-100 text-gray-900 rounded-bl-md"
//         }`}
//       >
//         {message.content}
//       </div>
//     </div>
//   );
// }

import { ChatMessage } from "@/lib/api";
import { RobotIcon, UserIcon } from "./Icons";

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                    ${
                      isUser
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    }`}
        aria-hidden="true"
      >
        {isUser ? <UserIcon className="h-5 w-5" /> : <RobotIcon className="h-5 w-5" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm
                    leading-relaxed shadow-sm
                    ${
                      isUser
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-gray-100 text-gray-900 rounded-bl-md dark:bg-gray-800 dark:text-gray-100"
                    }`}
      >
        {message.content || (
          <span className="inline-flex gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-current opacity-60" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-current opacity-60 [animation-delay:0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-current opacity-60 [animation-delay:0.3s]" />
          </span>
        )}
      </div>
    </div>
  );
}