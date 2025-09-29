import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SendHorizonal, Sun, Moon } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function MedicalChatBot() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! I am your medical assistant. What symptoms are you experiencing today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `type in russian language. All in russian language. You are a medical AI assistant. Answer the following question in English with evidence-based medicine principles. Question: ${input}`,
        }),
      });

      const data = await res.json();
      setMessages([...newMessages, { role: "bot", text: data.response || "Error: no response from server." }]);
    } catch (error) {
      setMessages([...newMessages, { role: "bot", text: "Connection error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 text-gray-900 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 dark:text-white transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg">
        <h1 className="text-xl font-bold">Medical ChatBot</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`max-w-xl px-4 py-3 rounded-2xl shadow-md backdrop-blur-sm whitespace-pre-wrap ${
              msg.role === "bot"
                ? "bg-blue-200 dark:bg-blue-600 self-start text-black dark:text-white"
                : "bg-green-200 dark:bg-green-600 self-end text-black dark:text-white"
            }`}
          >
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </motion.div>
        ))}
        {loading && <div className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Bot is typing...</div>}
      </div>

      {/* Input */}
      <div className="p-4 flex gap-2 border-t border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg">
        <input
          className="flex-1 p-3 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500 dark:placeholder-gray-400 text-black dark:text-white"
          placeholder="Describe your symptoms..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="p-3 bg-blue-600 dark:bg-blue-700 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors shadow-md text-white"
        >
          <SendHorizonal size={20} />
        </button>
      </div>
    </div>
  );
}
