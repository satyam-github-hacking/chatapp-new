```jsx
import { useEffect, useRef, useState, useContext } from "react";
import { AuthContext } from "./App";

const BG = "#111b21";
const SURFACE = "#202c33";
const ELEVATED = "#2a3942";
const GREEN = "#25d366";
const TEXT = "#e9edef";
const MUTED = "#8696a0";

/* YOUR RENDER BACKEND URL */
const API_BASE = "https://chatapp-backend-zrsg.onrender.com";

/* WEBSOCKET URL */
const WS_BASE = "wss://chatapp-backend-zrsg.onrender.com";

function Avatar({ name, size = 36 }) {
  const colors = [
    "#25d366",
    "#3b82f6",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
  ];

  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "700",
        fontSize: size * 0.4,
      }}
    >
      {name?.[0]?.toUpperCase() || "U"}
    </div>
  );
}

export default function ChatRoom({ room, onBack }) {
  const { user, token } = useContext(AuthContext);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [uploading, setUploading] = useState(false);

  /* FIXED WEBSOCKET URL */
  const wsUrl = `${WS_BASE}/ws/chat/${room.name}/?username=${encodeURIComponent(
    user.username
  )}`;

  /* CONNECT WEBSOCKET */
  useEffect(() => {
    console.log("Connecting WebSocket:", wsUrl);

    const ws = new WebSocket(wsUrl);

    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        console.log("WS message:", data);

        if (data.type === "history") {
          setMessages(data.messages || []);
        }

        if (data.type === "message") {
          setMessages((prev) => [
            ...prev,
            {
              username: data.username,
              message: data.message || "",
              file_url: data.file_url || "",
              file_name: data.file_name || "",
            },
          ]);
        }
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [wsUrl]);

  /* AUTO SCROLL */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /* SEND MESSAGE */
  const sendMessage = () => {
    const trimmed = message.trim();

    if (!trimmed) return;

    if (!socketRef.current) return;

    if (socketRef.current.readyState !== WebSocket.OPEN) {
      alert("WebSocket not connected");
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        message: trimmed,
        username: user.username,
      })
    );

    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  /* FILE UPLOAD */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/api/upload/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Upload failed");
        return;
      }

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            username: user.username,
            message: "",
            file_url: data.url,
            file_name: data.name,
          })
        );
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: BG,
        color: TEXT,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: SURFACE,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: MUTED,
            cursor: "pointer",
            fontSize: "22px",
          }}
        >
          ←
        </button>

        <Avatar name={room.displayName} />

        <div>
          <div
            style={{
              fontWeight: "600",
              fontSize: "16px",
            }}
          >
            {room.displayName}
          </div>

          <div
            style={{
              fontSize: "12px",
              color: connected ? GREEN : MUTED,
            }}
          >
            {connected ? "Online" : "Connecting..."}
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: MUTED,
              marginTop: "40px",
            }}
          >
            Say hello 👋
          </div>
        )}

        {messages.map((msg, index) => {
          const isMe = msg.username === user.username;

          return (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "75%",
                  background: isMe ? "#005c4b" : ELEVATED,
                  padding: "10px 14px",
                  borderRadius: "12px",
                  wordBreak: "break-word",
                }}
              >
                {!isMe && (
                  <div
                    style={{
                      color: GREEN,
                      fontSize: "12px",
                      marginBottom: "4px",
                      fontWeight: "600",
                    }}
                  >
                    {msg.username}
                  </div>
                )}

                {msg.message && (
                  <div
                    style={{
                      color: TEXT,
                      fontSize: "15px",
                    }}
                  >
                    {msg.message}
                  </div>
                )}

                {msg.file_url && (
                  <a
                    href={`${API_BASE}${msg.file_url}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#7dd3fc",
                      textDecoration: "none",
                      fontSize: "14px",
                    }}
                  >
                    📎 {msg.file_name}
                  </a>
                )}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div
        style={{
          background: SURFACE,
          padding: "10px 16px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        {/* FILE BUTTON */}
        <label
          style={{
            cursor: uploading ? "not-allowed" : "pointer",
            fontSize: "20px",
            color: uploading ? GREEN : MUTED,
          }}
        >
          📎
          <input
            type="file"
            hidden
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>

        {/* MESSAGE INPUT */}
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={!connected}
          style={{
            flex: 1,
            padding: "12px 16px",
            background: ELEVATED,
            border: "none",
            borderRadius: "24px",
            color: TEXT,
            fontSize: "15px",
            outline: "none",
          }}
        />

        {/* SEND BUTTON */}
        <button
          onClick={sendMessage}
          disabled={!connected || !message.trim()}
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "50%",
            border: "none",
            background:
              connected && message.trim() ? GREEN : ELEVATED,
            color: "white",
            cursor:
              connected && message.trim()
                ? "pointer"
                : "not-allowed",
            fontSize: "18px",
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
```
