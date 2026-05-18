import { useEffect, useRef, useState, useContext } from "react";
import { AuthContext } from "./App";

const BG = "#111b21";
const SURFACE = "#202c33";
const ELEVATED = "#2a3942";
const GREEN = "#25d366";
const TEXT = "#e9edef";
const MUTED = "#8696a0";

/* BACKEND URL */
const API_BASE =
  import.meta.env.VITE_API_URL || "https://YOUR-BACKEND.onrender.com";

/* WEBSOCKET URL */
const WS_BASE = API_BASE.replace("https://", "wss://").replace(
  "http://",
  "ws://",
);

function Avatar({ name, size = 38 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: GREEN,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "700",
        fontSize: size * 0.42,
        flexShrink: 0,
      }}
    >
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

export default function ChatRoom({ room, onBack }) {
  const { user } = useContext(AuthContext);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  /* FIXED WEBSOCKET URL */
  const wsUrl =
    WS_BASE +
    "/ws/chat/" +
    room.name +
    "/?username=" +
    encodeURIComponent(user.username);

  /* CONNECT WEBSOCKET */
  useEffect(() => {
    const ws = new WebSocket(wsUrl);

    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket Connected");
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "history") {
          setMessages(data.messages || []);
        }

        if (data.type === "message") {
          setMessages((prev) => [...prev, data]);
        }
      } catch (err) {
        console.log("Message parse error", err);
      }
    };

    ws.onerror = (err) => {
      console.log("WebSocket Error:", err);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket Closed");
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
    if (!message.trim()) return;

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          message: message.trim(),
          username: user.username,
        }),
      );

      setMessage("");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
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
          borderBottom: "1px solid #2a3942",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: TEXT,
            fontSize: "22px",
            cursor: "pointer",
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
              marginTop: "30px",
              fontSize: "14px",
            }}
          >
            Start chatting 👋
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.username === user.username;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  background: isMe ? "#005c4b" : ELEVATED,
                  color: TEXT,
                  padding: "10px 14px",
                  borderRadius: isMe
                    ? "14px 14px 4px 14px"
                    : "14px 14px 14px 4px",
                  maxWidth: "75%",
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

                <div>{msg.message}</div>
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
          padding: "10px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          borderTop: "1px solid #2a3942",
          flexShrink: 0,
        }}
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          style={{
            flex: 1,
            background: ELEVATED,
            border: "none",
            borderRadius: "24px",
            padding: "12px 16px",
            color: TEXT,
            outline: "none",
            fontSize: "15px",
          }}
        />

        <button
          onClick={sendMessage}
          disabled={!connected || !message.trim()}
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "50%",
            border: "none",
            background: connected && message.trim() ? GREEN : ELEVATED,
            color: "white",
            fontSize: "18px",
            cursor: connected && message.trim() ? "pointer" : "not-allowed",
            flexShrink: 0,
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
