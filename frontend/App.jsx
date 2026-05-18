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

const BG = "#111b21";
const SURFACE = "#202c33";
const GREEN = "#25d366";
const TEXT = "#e9edef";
const MUTED = "#8696a0";

/* API */
const API_BASE =
  import.meta.env.VITE_API_URL || "https://YOUR-BACKEND.onrender.com";

/* ICONS */

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
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);

const ProfileIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? GREEN : MUTED}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

/* SEARCH BAR */

function TopBar({ searchQuery, setSearchQuery, searchResults, onUserSelect }) {
  return (
    <div
      style={{
        background: SURFACE,
        padding: "12px 16px",
        borderBottom: "1px solid #2a3942",
      }}
    >
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search users..."
        style={{
          width: "100%",
          background: "#2a3942",
          border: "none",
          borderRadius: "8px",
          padding: "10px 14px",
          color: TEXT,
          outline: "none",
          fontSize: "14px",
          boxSizing: "border-box",
        }}
      />

      {searchQuery.length >= 2 && (
        <div
          style={{
            marginTop: "10px",
            background: "#1f2937",
            borderRadius: "10px",
            overflow: "hidden",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {searchResults.length === 0 ? (
            <div
              style={{
                padding: "14px",
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
                  padding: "12px 14px",
                  cursor: "pointer",
                  borderBottom: "1px solid #2a3942",
                }}
              >
                <div
                  style={{
                    color: TEXT,
                    fontWeight: "600",
                  }}
                >
                  {u.username}
                </div>

                {u.mobile_number && (
                  <div
                    style={{
                      color: MUTED,
                      fontSize: "12px",
                      marginTop: "2px",
                    }}
                  >
                    {u.mobile_number}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* FOOTER */

function BottomNav({ current, onChange }) {
  const tabs = [
    { id: "chats", label: "Chats", Icon: ChatIcon },
    { id: "calls", label: "Calls", Icon: CallIcon },
    { id: "groups", label: "Groups", Icon: GroupIcon },
    { id: "profile", label: "Profile", Icon: ProfileIcon },
  ];

  return (
    <div
      style={{
        background: SURFACE,
        display: "flex",
        borderTop: "1px solid #2a3942",
        flexShrink: 0,
      }}
    >
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          style={{
            flex: 1,
            padding: "10px 0",
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "3px",
          }}
        >
          <Icon active={current === id} />

          <span
            style={{
              fontSize: "11px",
              color: current === id ? GREEN : MUTED,
            }}
          >
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}

/* APP */

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState("chats");
  const [chatRoom, setChatRoom] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  /* LOAD AUTH */

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
    if (searchQuery.length < 2 || !token) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          API_BASE + "/api/search/?q=" + encodeURIComponent(searchQuery),
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          },
        );

        const data = await res.json();
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, token]);

  /* LOGIN */

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);

    localStorage.setItem("authToken", authToken);
    localStorage.setItem("authUser", JSON.stringify(userData));
  };

  /* LOGOUT */

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  };

  if (loading) {
    return <div style={{ background: BG, height: "100vh" }} />;
  }

  if (!user) {
    return (
      <AuthContext.Provider value={{ login }}>
        <AuthPage />
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, logout }}>
      <NavContext.Provider value={{ setChatRoom, setCurrentPage }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            background: BG,
            color: TEXT,
            overflow: "hidden",
          }}
        >
          {!chatRoom && (
            <TopBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchResults={searchResults}
              onUserSelect={(u) => {
                const id1 = Math.min(user.id, u.id);
                const id2 = Math.max(user.id, u.id);

                setChatRoom({
                  name: `dm_${id1}_${id2}`,
                  displayName: u.username,
                });

                setSearchQuery("");
                setSearchResults([]);
              }}
            />
          )}

          <div style={{ flex: 1, overflow: "hidden" }}>
            {chatRoom ? (
              <ChatRoom room={chatRoom} onBack={() => setChatRoom(null)} />
            ) : (
              <>
                {currentPage === "chats" && <ChatsPage />}
                {currentPage === "calls" && <CallsPage />}
                {currentPage === "groups" && <GroupsPage />}
                {currentPage === "profile" && <ProfilePage />}
              </>
            )}
          </div>

          <BottomNav current={currentPage} onChange={setCurrentPage} />
        </div>
      </NavContext.Provider>
    </AuthContext.Provider>
  );
}
