import { useLocation, useNavigate } from "react-router-dom";
import { Tooltip } from "antd";
import {
  Home, Box, FileText, Sun, Moon, User, LogOut,
  Type, Palette, Clock, File,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { title: "Home", path: "/", icon: Home },
  { title: "SVG Viewer", path: "/svg-viewer", icon: Box },
  { title: "Notes", path: "/notes", icon: FileText },
  // { title: "Text", path: "/text-tools", icon: Type },
  // { title: "Colors", path: "/color-tools", icon: Palette },
  // { title: "DateTime", path: "/datetime-tools", icon: Clock },
  // { title: "Excel to PDF", path: "/excel-to-pdf", icon: File },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <div className="w-14 min-w-14 h-screen flex flex-col items-center bg-card border-r border-border py-3 gap-1">
      {/* Logo */}
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4">
        <img src="/coding.png" alt="Logo" className="w-10 h-10" />
      </div>

      {/* Nav items - scrollable */}
      <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden py-1 scrollbar-thin">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Tooltip key={item.path} title={item.title} placement="right">
              <button
                onClick={() => navigate(item.path)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all border shrink-0 ${
                  isActive
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
              </button>
            </Tooltip>
          );
        })}
      </div>

      {/* User actions */}
      <div className="flex flex-col gap-2 mt-2 mb-2">
        {user ? (
          <>
            <Tooltip title={`Profile: ${user?.username}`} placement="right">
              <button className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
                <User className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip title="Logout" placement="right">
              <button
                onClick={logout}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </Tooltip>
          </>
        ) : (
          <Tooltip title="Sign In" placement="right">
            <button
              onClick={() => navigate('/sign-in')}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
            >
              <User className="w-4 h-4" />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Theme toggle */}
      <Tooltip title={theme === "light" ? "Dark mode" : "Light mode"} placement="right">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </Tooltip>
    </div>
  );
};

export default AppSidebar;
