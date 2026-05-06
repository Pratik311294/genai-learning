import { useState, useRef, useEffect } from "react";
import "./App.css";

const BACKEND_URL = "http://localhost:3000";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null); // for auto-scroll

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const updatedMessages = [...messages, { role: "user", text: trimmed }];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await response.json();

      const reply = data.reply || "Error: No reply received";
      setMessages([...updatedMessages, { role: "assistant", text: reply }]);
    } catch (error) {
      console.error("Fetch error:", error);
      setMessages([
        ...updatedMessages,
        { role: "assistant", text: "❌ Could not reach backend. Is it running?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="container">
      <h2> ✨ Gini🧞 ✨</h2>
      <p className="title">Ask me anything!</p>

      <div className="chat-box">
        {messages.length === 0 && (
          <p className="placeholder">Send a message to start chatting...</p>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`bubble ${msg.role}`}>
            <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.text}
          </div>
        ))}

        {loading && (
          <div className="bubble thinking">AI is thinking...</div>
        )}

        {/* invisible div to scroll to */}
        <div ref={bottomRef} />
      </div>

      <div className="input-row">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
          rows={2}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}