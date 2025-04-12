import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

export default function App() {
  const inputRef = useRef();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const userMessage = inputRef.current.value;
    console.log("Sending message:", userMessage);

    if (!userMessage.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user", parts: [{ text: userMessage }] },
    ];

    inputRef.current.value = "";
    setMessages(newMessages);
    setIsLoading(true);

    try {
      console.log("Making API request with data:", {
        chat: userMessage,
        history: messages,
      });

      const response = await axios.post(
        "https://server-xjqa.onrender.com/chat",
        {
          chat: userMessage,
          history: messages,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      console.log("Received response:", response.data);

      setMessages([
        ...newMessages,
        { role: "model", parts: [{ text: response.data.text }] },
      ]);
    } catch (error) {
      console.error("Detailed error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setMessages([
        ...newMessages,
        {
          role: "model",
          parts: [{ text: "An error occurred. Please try again." }],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-none bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-800">AI Chat</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <p className="text-xl font-semibold">Welcome!</p>
              <p>Start a conversation by typing a message below.</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] overflow-x-scroll  ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white shadow text-gray-800"
                }`}
              >
                <ReactMarkdown>{message.parts[0].text}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-none bg-white border-t w-full">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-4">
            <textarea
              ref={inputRef}
              disabled={isLoading}
              onKeyDown={handleKeyPress}
              placeholder={
                isLoading ? "Waiting for response..." : "Type your message..."
              }
              className="flex-1 resize-none rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
