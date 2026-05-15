import { useEffect, useRef, useState, useContext } from "react";
import { AuthContext } from "./App";

const BG = "#111b21";
const SURFACE = "#202c33";
const ELEVATED = "#2a3942";
const GREEN = "#25d366";
const TEXT = "#e9edef";
const MUTED = "#8696a0";

const WS_PROTOCOL = window.location.protocol === "https:" ? "wss" : "ws";

function Avatar({ name, size = 36 }) {
  const colors = ["#25d366", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: color, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontWeight: "700", fontSize: size * 0.4,
    }}>
      {name[0].toUpperCase()}
    </div>
  );
}

function FileIcon({ ext }) {
  const iconMap = {
    pdf: { color: "#ef4444", label: "PDF" },
    doc: { color: "#3b82f6", label: "DOC" },
    docx: { color: "#3b82f6", label: "DOC" },
    xls: { color: "#22c55e", label: "XLS" },
    xlsx: { color: "#22c55e", label: "XLS" },
    ppt: { color: "#f97316", label: "PPT" },
    pptx: { color: "#f97316", label: "PPT" },
    zip: { color: "#a855f7", label: "ZIP" },
    rar: { color: "#a855f7", label: "RAR" },
    txt: { color: "#6b7280", label: "TXT" },
    mp4: { color: "#06b6d4", label: "MP4" },
    mp3: { color: "#ec4899", label: "MP3" },
  };
  const info = iconMap[ext?.toLowerCase()] || { color: "#8696a0", label: (ext || "FILE").toUpperCase().slice(0, 4) };
  return (
    <div style={{
      width: 40, height: 44, borderRadius: "6px", background: info.color,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontSize: "10px", fontWeight: "700", flexShrink: 0,
    }}>
      {info.label}
    </div>
  );
}

function FileBubble({ file_url, file_name }) {
  const ext = file_name?.split('.').pop() || '';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext.toLowerCase());

  if (isImage) {
    return (
      <a href={file_url} target="_blank" rel="noreferrer">
        <img src={file_url} alt={file_name} style={{ maxWidth: "240px", maxHeight: "200px", borderRadius: "8px", display: "block" }} />
      </a>
    );
  }

  return (
    <a
      href={file_url}
      target="_blank"
      rel="noreferrer"
      download={file_name}
      style={{ textDecoration: "none" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 0" }}>
        <FileIcon ext={ext} />
        <div style={{ minWidth: 0 }}>
          <div style={{ color: TEXT, fontSize: "14px", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>{file_name}</div>
          <div style={{ color: MUTED, fontSize: "11px", marginTop: "2px" }}>Tap to download</div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill={MUTED} style={{ flexShrink: 0 }}>
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>
      </div>
    </a>
  );
}

export default function ChatRoom({ room, onBack }) {
  const { user, token } = useContext(AuthContext);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const wsUrl = `${WS_PROTOCOL}://${window.location.host}/ws/chat/${room.name}/?username=${encodeURIComponent(user.username)}`;

  useEffect(() => {
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => setConnected(true);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "history") {
          setMessages(data.messages);
        } else if (data.type === "message") {
          setMessages((prev) => [...prev, {
            username: data.username,
            message: data.message,
            file_url: data.file_url || '',
            file_name: data.file_name || '',
          }]);
        }
      } catch {
        console.error("Failed to parse message:", event.data);
      }
    };

    ws.onerror = () => console.error("WebSocket error");
    ws.onclose = () => setConnected(false);
    socketRef.current = ws;
    return () => ws.close();
  }, [wsUrl]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify({ message: trimmed, username: user.username }));
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/", {
        method: "POST",
        headers: { Authorization: `Token ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Upload failed");
        return;
      }
      const { url, name } = await res.json();
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          message: "",
          username: user.username,
          file_url: url,
          file_name: name,
        }));
      }
    } catch (err) {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, color: TEXT }}>
      {/* Header */}
      <div style={{ background: SURFACE, padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={onBack}
          style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: "20px", padding: "4px", display: "flex", alignItems: "center" }}
        >←</button>
        <Avatar name={room.displayName} />
        <div>
          <div style={{ fontWeight: "600", fontSize: "16px", color: TEXT }}>{room.displayName}</div>
          <div style={{ fontSize: "12px", color: connected ? GREEN : MUTED }}>
            {connected ? "Online" : "Connecting..."}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: MUTED, marginTop: "40px", fontSize: "14px" }}>
            Say hello! 👋
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.username === user.username;
          const showAvatar = !isMe && (i === 0 || messages[i - 1]?.username !== msg.username);
          const hasFile = !!msg.file_url;
          return (
            <div key={i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", alignItems: "flex-end", gap: "8px", marginBottom: "2px" }}>
              {!isMe && (showAvatar ? <Avatar name={msg.username} size={30} /> : <div style={{ width: 30 }} />)}
              <div style={{ maxWidth: "70%" }}>
                {!isMe && showAvatar && (
                  <div style={{ fontSize: "12px", color: GREEN, marginBottom: "2px", paddingLeft: "4px" }}>{msg.username}</div>
                )}
                <div style={{
                  padding: hasFile ? "10px 12px" : "8px 12px",
                  borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                  background: isMe ? "#005c4b" : ELEVATED,
                  color: TEXT,
                  fontSize: "15px",
                  wordBreak: "break-word",
                }}>
                  {hasFile ? (
                    <FileBubble file_url={msg.file_url} file_name={msg.file_name} />
                  ) : (
                    msg.message
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ background: SURFACE, padding: "10px 16px", display: "flex", gap: "8px", alignItems: "center" }}>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={!connected || uploading}
          title="Attach file"
          style={{
            width: "40px", height: "40px", borderRadius: "50%", border: "none",
            background: "transparent", color: uploading ? GREEN : MUTED,
            cursor: connected && !uploading ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "color 0.2s",
          }}
        >
          {uploading ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ animation: "spin 1s linear infinite" }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
            </svg>
          )}
        </button>

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={!connected}
          style={{
            flex: 1, padding: "11px 16px", background: ELEVATED, border: "none",
            borderRadius: "24px", color: TEXT, fontSize: "15px", outline: "none",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!connected || !message.trim()}
          style={{
            width: "44px", height: "44px", borderRadius: "50%", border: "none",
            background: connected && message.trim() ? GREEN : ELEVATED,
            color: "white", cursor: connected && message.trim() ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
            flexShrink: 0, transition: "background 0.2s",
          }}
        >➤</button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
