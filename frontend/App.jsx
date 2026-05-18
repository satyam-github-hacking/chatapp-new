import { useState, useEffect, createContext, useContext } from "react";
import AuthPage from "./AuthPage";
import ChatsPage from "./ChatsPage";
import ChatRoom from "./ChatRoom";
import CallsPage from "./CallsPage";
import GroupsPage from "./GroupsPage";
import ProfilePage from "./ProfilePage";

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const NavContext = createContext(null);
export const useNav = () => useContext(NavContext);

const API_BASE = "https://chatapp-backend-zrsg.onrender.com";

const BG = "#111b21";
const SURFACE = "#202c33";
const GREEN = "#25d366";
const TEXT = "#e9edef";
const MUTED = "#8696a0";

/* ───────────────── ICONS ───────────────── */

const ChatIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? GREEN : MUTED}>
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
  </svg>
);

const CallIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? GREEN : MUTED}>
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
  </svg>
);

const GroupIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? GREEN : MUTED}>
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);

const ProfileIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? GREEN : MUTED}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={MUTED}>
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

/* ───────────────── TOP BAR ───────────────── */

function TopBar({
  title,
  showSearch,
  onSearchToggle,
  searchQuery,
  onSearchChange,
  searchResults,
  onUserSelect,
}) {
  return (
    <div
      style={{
        background: SURFACE,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <h2 style={{ margin: 0, color: TEXT }}>{title}</h2>

      <div style={{ position: "relative" }}>
        {showSearch ? (
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search users..."
              style={{
                background: "#2a3942",
                border: "none",
                borderRadius: "8px",
                padding: "8px 12px",
                color: TEXT,
                width: "220px",
                outline: "none",
              }}
            />

            <button
              onClick={onSearchToggle}
              style={{
                background: "none",
                border: "none",
                color: MUTED,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={onSearchToggle}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <SearchIcon />
          </button>
        )}

        {showSearch && searchQuery.length >= 2 && (
          <div
            style={{
              position: "absolute",
              top: "45px",
              right: 0,
              background: "#1f2937",
              borderRadius: "10px",
              width: "280px",
              maxHeight: "320px",
              overflowY: "auto",
              zIndex: 999,
            }}
          >
            {searchResults.length === 0 ? (
              <div
                style={{
                  padding: "18px",
                  color: MUTED,
                  textAlign: "center",
                }}
              >
                No users found
              </div>
            ) : (
              searchResults.map((u) => (
                <div
                  key={u.id}
                  onClick={() => onUserSelect(u)}
                  style={{
                    padding: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #2a3942",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: GREEN,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    {u.username[0].toUpperCase()}
                  </div>

                  <div>
                    <div style={{ color: TEXT, fontWeight: "600" }}>
                      {u.username}
                    </div>

                    {u.mobile_number && (
                      <div style={{ color: MUTED, fontSize: "12px" }}>
                        {u.mobile_number}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────── APP ───────────────── */

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState("chats");
  const [chatRoom, setChatRoom] = useState(null);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("authUser");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  /* SEARCH USERS */

  useEffect(() => {
    if (!showSearch || searchQuery.length < 2 || !token) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const r = await fetch(
          `${API_BASE}/api/search/?q=${encodeURIComponent(searchQuery)}`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          },
        );

        const data = await r.json();
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, showSearch, token]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);

    localStorage.setItem("authToken", authToken);
    localStorage.setItem("authUser", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/logout/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
      });
    } catch {}

    setUser(null);
    setToken(null);

    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  };

  const handleUserSelect = (u) => {
    const id1 = Math.min(user.id, u.id);
    const id2 = Math.max(user.id, u.id);

    const roomName = `dm_${id1}_${id2}`;

    setChatRoom({
      name: roomName,
      displayName: u.username,
    });

    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const toggleSearch = () => {
    setShowSearch((s) => !s);
    setSearchQuery("");
    setSearchResults([]);
  };

  if (loading) {
    return <div style={{ background: BG, height: "100vh" }} />;
  }

  if (!user) {
    return (
      <AuthContext.Provider value={{ login, API_BASE }}>
        <AuthPage />
      </AuthContext.Provider>
    );
  }

  if (chatRoom) {
    return (
      <AuthContext.Provider value={{ user, token, logout, API_BASE }}>
        <NavContext.Provider value={{ setChatRoom }}>
          <ChatRoom room={chatRoom} onBack={() => setChatRoom(null)} />
        </NavContext.Provider>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, logout, API_BASE }}>
      <NavContext.Provider value={{ setChatRoom, setCurrentPage }}>
        <div
          style={{
            background: BG,
            color: TEXT,
            height: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TopBar
            title="ChatApp"
            showSearch={showSearch}
            onSearchToggle={toggleSearch}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchResults={searchResults}
            onUserSelect={handleUserSelect}
          />

          <div style={{ flex: 1, overflow: "auto" }}>
            {currentPage === "chats" && <ChatsPage />}
            {currentPage === "calls" && <CallsPage />}
            {currentPage === "groups" && <GroupsPage />}
            {currentPage === "profile" && <ProfilePage />}
          </div>
        </div>
      </NavContext.Provider>
    </AuthContext.Provider>
  );
}
