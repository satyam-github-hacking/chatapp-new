const MUTED = "#8696a0";
const GREEN = "#25d366";

const recentCalls = [
  { name: "Alice", type: "Incoming", time: "Today, 2:30 PM", icon: "📞" },
  { name: "Bob", type: "Outgoing", time: "Today, 11:15 AM", icon: "📞" },
  { name: "Charlie", type: "Missed", time: "Yesterday", icon: "📞" },
];

export default function CallsPage() {
  return (
    <div style={{ padding: "16px 0" }}>
      <div style={{ padding: "0 16px 12px", color: MUTED, fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Recent
      </div>
      {recentCalls.map((call, i) => (
        <div
          key={i}
          style={{
            display: "flex", alignItems: "center", gap: "14px",
            padding: "14px 16px", borderBottom: "1px solid #2a3942", cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#2a3942")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <div style={{
            width: 48, height: 48, borderRadius: "50%", background: "#3b82f6",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: "700", fontSize: "18px", flexShrink: 0,
          }}>
            {call.name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#e9edef", fontWeight: "600", marginBottom: "2px" }}>{call.name}</div>
            <div style={{ color: call.type === "Missed" ? "#ef4444" : MUTED, fontSize: "13px" }}>
              {call.type === "Incoming" ? "↙ " : call.type === "Outgoing" ? "↗ " : "↙ "}{call.type} · {call.time}
            </div>
          </div>
          <button style={{ background: "none", border: "none", color: GREEN, fontSize: "22px", cursor: "pointer" }}>📞</button>
        </div>
      ))}

      <div style={{ textAlign: "center", padding: "40px 20px", color: MUTED }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>📞</div>
        <p style={{ margin: 0, fontSize: "14px" }}>Voice & video calls coming soon.</p>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#4b5563" }}>Find users via search to start a chat.</p>
      </div>
    </div>
  );
}
