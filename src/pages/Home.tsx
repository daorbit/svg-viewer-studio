import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Box,
  FileText,
  LogIn,
  Braces,
  Binary,
  Type,
  Palette,
  Shield,
  Link,
  AlignLeft,
  Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const tools = [
  {
    id: "svg-viewer",
    title: "SVG Viewer Studio",
    description:
      "Preview, edit, and convert SVG files to React, React Native, Data URI.",
    icon: <Box className="w-6 h-6" />,
    path: "/svg-viewer",
    ready: true,
    tag: "Live",
  },
  {
    id: "document-studio",
    title: "Document Studio",
    description:
      "Rich text editor with export to PDF. All data stored locally.",
    icon: <FileText className="w-6 h-6" />,
    path: "/notes",
    ready: true,
    tag: "Live",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="bg-background min-h-full">
      {/* Hero */}
      <section className="px-6 md:px-12 pt-12 md:pt-20 pb-8 md:pb-12 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Developer Toolkit
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4">
          {" "}
          Dev Tools <span className="text-primary">Studio</span>
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed mb-5">
          A collection of essential developer utilities. All tools run locally
          in your browser — no data leaves your machine.
        </p>
        {!user && (
          <button
            onClick={() => navigate("/sign-in")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <LogIn className="w-4 h-4" />
            Sign In to sync your data
          </button>
        )}
      </section>

      {/* Tools grid */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 pb-20">
        {" "}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            All Tools
          </h2>
          <span className="text-xs text-muted-foreground">
            {tools.filter((t) => t.ready).length} available
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {tools.map((tool, i) => (
            <button
              key={tool.id}
              onClick={() => tool.ready && navigate(tool.path)}
              disabled={!tool.ready}
              className={`group relative text-left p-5 rounded-xl border transition-all duration-300 outline-none animate-fade-in ${
                tool.ready
                  ? "border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 cursor-pointer"
                  : "border-border/50 bg-card/50 cursor-not-allowed opacity-60"
              }`}
              style={{
                animationDelay: `${i * 50}ms`,
                animationFillMode: "both",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    tool.ready
                      ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110"
                      : "bg-muted text-muted-foreground/50"
                  }`}
                >
                  {tool.icon}
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {tool.tag}
                </span>
              </div>
              <h3 className="font-semibold text-sm md:text-base mb-1 text-foreground">
                {tool.title}
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {tool.description}
              </p>
              {tool.ready && (
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Open tool <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
