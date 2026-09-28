import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  QrCode,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  ChevronRight,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    roles: ["admin", "guard", "resident"],
  },
  {
    to: "/visitors",
    icon: Users,
    label: "All Visitors",
    roles: ["admin", "guard", "resident"],
  },
  {
    to: "/guards",
    icon: Users,
    label: "All Guards",
    roles: ["admin"],
  },
  {
    to: "/add-visitor",
    icon: UserPlus,
    label: "Add Visitor",
    roles: ["admin", "guard", "resident"],
  },
  {
    to: "/scan-qr",
    icon: QrCode,
    label: "Scan QR Pass",
    roles: ["admin", "guard"],
  },
  { to: "/residents", icon: BarChart3, label: "All Residents", roles: ["admin"] },
  // { to: "/analytics", icon: BarChart3, label: "Analytics", roles: ["admin"] },
  { to: "/add-resident", icon: UserPlus, label: "Add Resident/Guard", roles: ["admin"] },
];

const ROLE_COLORS = {
  admin: "#4f7fff",
  guard: "#ffb84f",
  resident: "#00d4aa",
};

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const filteredNav = NAV_ITEMS.filter((n) => n.roles.includes(user?.role));
  const roleColor = ROLE_COLORS[user?.role] || "#4f7fff";
  const roleName = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      style={{
        width: "260px",
        flexShrink: 0,
        background: "var(--c-navy)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow top */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          left: "-80px",
          width: "240px",
          height: "240px",
          background:
            "radial-gradient(circle, rgba(79,127,255,.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      {/* Ambient glow bottom */}
      <div
        style={{
          position: "absolute",
          bottom: "50px",
          right: "-60px",
          width: "180px",
          height: "180px",
          background:
            "radial-gradient(circle, rgba(255,79,139,.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Logo ── */}
      <div
        style={{
          padding: "24px 20px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid rgba(255,255,255,.06)",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            flexShrink: 0,
            background: "linear-gradient(135deg, #4f7fff, #6a4fff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(79,127,255,.35)",
          }}
        >
          <Shield size={18} color="#fff" strokeWidth={2.5} />
        </div>
        <div style={{ flex: 1, lineHeight: 1.2 }}>
          <div
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-.2px",
            }}
          >
            GatePass
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,.35)",
              letterSpacing: ".2px",
            }}
          >
            Visitor Management
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,.3)",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "6px",
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav
        style={{
          flex: 1,
          padding: "14px 12px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "1.2px",
            color: "rgba(255,255,255,.22)",
            textTransform: "uppercase",
            padding: "6px 8px 10px",
          }}
        >
          Navigation
        </div>

        {filteredNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "#fff" : "rgba(255,255,255,.42)",
              background: isActive ? "rgba(79,127,255,.18)" : "transparent",
              borderLeft: isActive
                ? "3px solid #4f7fff"
                : "3px solid transparent",
              textDecoration: "none",
              cursor: "pointer",
              transition: "all .18s ease",
            })}
          >
            <span
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                background: "rgba(255,255,255,.055)",
              }}
            >
              <Icon size={15} strokeWidth={2} />
            </span>
            <span style={{ flex: 1 }}>{label}</span>
            <ChevronRight size={12} style={{ opacity: 0.2 }} />
          </NavLink>
        ))}
      </nav>

      {/* ── User ── */}
      <div
        style={{
          padding: "12px",
          borderTop: "1px solid rgba(255,255,255,.06)",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 12px",
            borderRadius: "10px",
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.07)",
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              flexShrink: 0,
              background: `linear-gradient(135deg, ${roleColor}, ${roleColor}99)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {getInitials(user?.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "rgba(255,255,255,.85)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.name}
            </div>
            <span
              style={{
                display: "inline-block",
                fontSize: "10px",
                fontWeight: 700,
                marginTop: "3px",
                padding: "2px 7px",
                borderRadius: "999px",
                background: `${roleColor}22`,
                color: roleColor,
                letterSpacing: ".2px",
              }}
            >
              {roleName}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            padding: "9px 12px",
            marginTop: "4px",
            border: "none",
            background: "none",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 500,
            color: "rgba(255,79,139,.5)",
            cursor: "pointer",
            transition: "all .18s ease",
            textAlign: "left",
          }}
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </div>
  );
}
