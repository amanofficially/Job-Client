import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Topbar = ({ title, onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden shrink-0 text-muted hover:text-ink p-1.5 -ml-1.5 rounded-lg hover:bg-bg"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base sm:text-lg font-display font-semibold truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-light text-primary-dark flex items-center justify-center text-xs font-semibold shrink-0">
            {initials}
          </div>
          <span className="hidden sm:inline text-sm font-medium max-w-[140px] truncate">{user?.name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-muted hover:text-danger transition-colors shrink-0"
          title="Log out"
          aria-label="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
