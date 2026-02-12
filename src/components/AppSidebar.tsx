import { useLocation, useNavigate } from "react-router-dom";
import { Tooltip } from "antd";
import {
  Home,
  Box,
  FileText,
  Code2,
  Braces,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const navItems = [
  { title: "Home", path: "/", icon: Home },
  { title: "SVG Viewer", path: "/svg-viewer", icon: Box },
  { title: "Notes", path: "/notes", icon: FileText },
  { title: "Code Snippets", path: "/code-snippets", icon: Code2 },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="w-14 min-w-14 h-screen flex flex-col items-center bg-card border-r border-border py-3 gap-1">
      {/* Logo */}
      <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center mb-4">
        <span className="text-primary-foreground font-bold text-sm">DT</span>
      </div>

      {/* Nav items */}
      <div className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Tooltip key={item.path} title={item.title} placement="right">
              <button
                onClick={() => navigate(item.path)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
              </button>
            </Tooltip>
          );
        })}
      </div>

      {/* Theme toggle at bottom */}
      <Tooltip title={theme === "light" ? "Dark mode" : "Light mode"} placement="right">
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </Tooltip>
    </div>
  );
};

export default AppSidebar;
