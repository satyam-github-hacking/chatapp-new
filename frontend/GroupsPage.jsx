import { useState, useContext } from "react";
import { AuthContext, NavContext } from "./App";

const BG = "#111b21";
const SURFACE = "#202c33";
const ELEVATED = "#2a3942";
const GREEN = "#25d366";
const TEXT = "#e9edef";
const MUTED = "#8696a0";

export default function GroupsPage() {
  const { token } = useContext(AuthContext);
  const { setChatRoom } = useContext(NavContext);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [joining, setJoining] = useState(null);
  const [joined, setJoined] = useState({});

  const handleSearch = async (q) => {
    setQuery(q);
    if (q.trim().length < 1) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/groups/search/?q=${encodeURIComponent(q.trim())}`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleJoin = async (group) => {
    setJoining(group.name);
    try {
      await fetch(`/api/groups/${group.name}/join/`, {
        method: "POST",
        headers: { Authorization: `Token ${token}` },
      });
      setJoined((prev) => ({ ...prev, [group.name]: true }));
      setResults((prev) =>
        prev.map((g) => g.name === group.name ? { ...g, joined: true } : g)
      );
    } catch {
    } finally {
      setJoining(null);
    }
  };

  const handleOpen = (group) => {
    setChatRoom({ name: group.name, displayName: group.display_name });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "16px", background: SURFACE, borderBottom: `1px solid ${ELEVATED}` }}>
        <div style={{ position: "relative" }}>
          <svg
            width="18" height="18" viewBox="0 0 24 24" fill={MUTED}
            style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          >
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search groups by name..."
            style={{
              width: "100%", padding: "11px 16px 11px 44px", background: ELEVATED,
              border: "none", borderRadius: "24px", color: TEXT, fontSize: "15px",
              outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        {query.trim().length === 0 && (
          <div style={{ padding: "48px 24px", textAlign: "center", color: MUTED }}>
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>👥</div>
            <div style={{ fontSize: "16px", color: TEXT, fontWeight: "600", marginBottom: "8px" }}>Find a Group</div>
            <div style={{ fontSize: "14px", lineHeight: "1.5" }}>
              Search for a group by its name to<br />find and join the conversation.
            </div>
          </div>
        )}

        {searching && (
          <div style={{ padding: "32px", textAlign: "center", color: MUTED, fontSize: "14px" }}>
            Searching...
          </div>
        )}

        {!searching && query.trim().length > 0 && results.length === 0 && (
          <div style={{ padding: "48px 24px", textAlign: "center", color: MUTED }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
            <div style={{ fontSize: "15px" }}>No groups found for "<b style={{ color: TEXT }}>{query}</b>"</div>
          </div>
        )}

        {results.map((group) => {
          const isJoined = group.joined || joined[group.name];
          return (
            <div
              key={group.name}
              style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "14px 16px", borderBottom: `1px solid ${ELEVATED}`,
              }}
            >
              <div style={{
                width: 50, height: 50, borderRadius: "50%", background: "#8b5cf6",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", flexShrink: 0,
              }}>
                👥
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: TEXT, fontWeight: "600", fontSize: "16px" }}>{group.display_name}</div>
                <div style={{ color: MUTED, fontSize: "13px", marginTop: "2px" }}>
                  {group.member_count} member{group.member_count !== 1 ? "s" : ""}
                </div>
              </div>
              {isJoined ? (
                <button
                  onClick={() => handleOpen(group)}
                  style={{
                    padding: "8px 18px", borderRadius: "20px", border: "none",
                    background: ELEVATED, color: GREEN,
                    fontWeight: "600", fontSize: "14px", cursor: "pointer", flexShrink: 0,
                  }}
                >
                  Open
                </button>
              ) : (
                <button
                  onClick={() => handleJoin(group)}
                  disabled={joining === group.name}
                  style={{
                    padding: "8px 18px", borderRadius: "20px", border: "none",
                    background: joining === group.name ? ELEVATED : GREEN,
                    color: "white", fontWeight: "600", fontSize: "14px",
                    cursor: joining === group.name ? "not-allowed" : "pointer", flexShrink: 0,
                  }}
                >
                  {joining === group.name ? "Joining..." : "Join"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
