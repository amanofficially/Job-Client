import { NavLink } from "react-router-dom";
import { LayoutDashboard, Send, ClipboardList, BellRing, User, Settings, Rocket, X } from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/apply", label: "Apply Job", icon: Send },
  { to: "/applications", label: "Applications", icon: ClipboardList },
  { to: "/follow-ups", label: "Follow-ups", icon: BellRing },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

const SidebarContent = ({ onNavigate }) => (
  <>
    <div className="flex items-center gap-2 px-6 py-6">
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
        <Rocket size={18} className="text-white" />
      </div>
      <span className="font-display font-semibold text-lg">JobPilot AI</span>
    </div>

    <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? "bg-primary-light text-primary-dark" : "text-muted hover:bg-bg hover:text-ink"
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>

    <div className="px-6 py-5 text-xs text-muted border-t border-border">
      JobPilot AI &copy; {new Date().getFullYear()}
    </div>
  </>
);

const Sidebar = ({ mobileOpen, onClose }) => {
  return (
    <>
      <aside className="hidden lg:flex w-64 shrink-0 h-screen sticky top-0 border-r border-border bg-surface flex-col">
        <SidebarContent />
      </aside>

      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="absolute inset-0 bg-ink/40 backdrop-blur-[1px]" onClick={onClose} />
        <aside
          className={`absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-surface flex flex-col shadow-xl transition-transform duration-200 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-4 text-muted hover:text-ink"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
          <SidebarContent onNavigate={onClose} />
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
