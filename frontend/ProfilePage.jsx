import { useContext } from "react";
import { AuthContext } from "./App";

const SURFACE = "#202c33";
const ELEVATED = "#2a3942";
const GREEN = "#25d366";
const TEXT = "#e9edef";
const MUTED = "#8696a0";

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", borderBottom: `1px solid ${ELEVATED}` }}>
      <span style={{ fontSize: "20px", width: "28px", textAlign: "center" }}>{icon}</span>
      <div>
        <div style={{ color: GREEN, fontSize: "13px", marginBottom: "2px" }}>{label}</div>
        <div style={{ color: TEXT, fontSize: "16px" }}>{value || <span style={{ color: MUTED }}>Not set</span>}</div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useContext(AuthContext);

  const colors = ["#25d366", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];
  const avatarColor = colors[user.username.charCodeAt(0) % colors.length];

  return (
    <div style={{ position: "relative", minHeight: "100%" }}>
      <div style={{ background: SURFACE, padding: "32px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", borderBottom: `1px solid ${ELEVATED}` }}>
        <div style={{
          width: 96, height: 96, borderRadius: "50%", background: avatarColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: "700", fontSize: "40px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}>
          {user.username[0].toUpperCase()}
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: TEXT, fontSize: "22px", fontWeight: "600" }}>{user.username}</div>
          <div style={{ color: MUTED, fontSize: "14px", marginTop: "4px" }}>Online</div>
        </div>
      </div>

      <div style={{ background: SURFACE, marginTop: "12px" }}>
        <div style={{ padding: "12px 16px 4px", color: GREEN, fontSize: "14px", fontWeight: "600" }}>Account info</div>
        <InfoRow icon="👤" label="Username" value={user.username} />
        <InfoRow icon="📱" label="Mobile number" value={user.mobile_number} />
        <InfoRow icon="🔑" label="Account ID" value={`#${user.id}`} />
      </div>

      <div style={{ padding: "24px 16px 12px" }}>
        <button
          onClick={logout}
          style={{
            width: "100%", padding: "13px", background: "transparent",
            border: `1px solid #ef4444`, borderRadius: "10px",
            color: "#ef4444", fontWeight: "600", fontSize: "15px",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#3d1515"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          Sign Out
        </button>
      </div>

      <div style={{ textAlign: "center", padding: "24px 16px 8px", borderTop: `1px solid ${ELEVATED}`, marginTop: "8px" }}>
        <div style={{ color: "#3d5a6a", fontSize: "13px", letterSpacing: "0.5px" }}>made by satyam</div>
      </div>
    </div>
  );
}
