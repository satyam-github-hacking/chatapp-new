import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext, NavContext } from "./App";

const SURFACE = "#202c33";
const ELEVATED = "#2a3942";
const GREEN = "#25d366";
const TEXT = "#e9edef";
const MUTED = "#8696a0";
const RED = "#ef4444";

function Avatar({ name, size = 48 }) {
  const colors = ["#25d366", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: color,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontWeight: "700", fontSize: size * 0.4, flexShrink: 0
    }}>
      {name[0].toUpperCase()}
    </div>
  );
}

function DeleteConfirm({ name, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
    }}>
      <div style={{ background: SURFACE, borderRadius: "16px", padding: "28px 24px", width: "300px", textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🗑️</div>
        <div style={{ color: TEXT, fontWeight: "600", fontSize: "16px", marginBottom: "8px" }}>Delete chat?</div>
        <div style={{ color: MUTED, fontSize: "14px", marginBottom: "24px" }}>
          This will remove "<b style={{ color: TEXT }}>{name}</b>" from your chat list.
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: ELEVATED, color: TEXT, cursor: "pointer", fontSize: "14px" }}
          >Cancel</button>
          <button
            onClick={onConfirm}
            style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: RED, color: "white", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}
          >Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function ChatsPage() {
  const { token } = useContext(AuthContext);
  const { setChatRoom } = useContext(NavContext);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetch("/api/rooms/", { headers: { Authorization: `Token ${token}` } })
      .then((r) => r.json())
      .then((data) => { setRooms(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const handleDelete = async (room) => {
    setConfirmDelete(null);
    try {
      await fetch(`/api/rooms/${room.name}/delete/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });
      setRooms((prev) => prev.filter((r) => r.name !== room.name));
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
        <div style={{ color: MUTED, fontSize: "14px" }}>Loading chats...</div>
      </div>
    );
  }

  return (
    <div>
      {confirmDelete && (
        <DeleteConfirm
          name={confirmDelete.display_name}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {rooms.length === 0 && (
        <div style={{ padding: "40px 20px", textAlign: "center", color: MUTED }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>💬</div>
          <p style={{ margin: 0 }}>No conversations yet.</p>
          <p style={{ margin: "4px 0 0", fontSize: "13px" }}>Use the search bar to find people and start chatting.</p>
        </div>
      )}

      {rooms.map((room) => (
        <div
          key={room.name}
          onMouseEnter={() => setHoveredRoom(room.name)}
          onMouseLeave={() => setHoveredRoom(null)}
          style={{
            display: "flex", alignItems: "center", gap: "14px",
            padding: "14px 16px", cursor: "pointer",
            borderBottom: `1px solid ${ELEVATED}`,
            background: hoveredRoom === room.name ? ELEVATED : "transparent",
            transition: "background 0.15s",
            position: "relative",
          }}
        >
          <div
            onClick={() => setChatRoom({ name: room.name, displayName: room.display_name })}
            style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: 0 }}
          >
            <Avatar name={room.display_name} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ color: TEXT, fontWeight: "600", fontSize: "16px" }}>{room.display_name}</span>
                {room.is_group && (
                  <span style={{ fontSize: "11px", color: GREEN, background: "#0d2e1a", padding: "2px 8px", borderRadius: "10px" }}>Group</span>
                )}
              </div>
              <div style={{ color: MUTED, fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "2px" }}>
                {room.last_sender
                  ? <><b style={{ color: "#adb5bd" }}>{room.last_sender}:</b> {room.last_message}</>
                  : room.last_message}
              </div>
            </div>
          </div>

          {room.name !== "general" && hoveredRoom === room.name && (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(room); }}
              title="Delete chat"
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "6px", borderRadius: "50%", color: RED,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
