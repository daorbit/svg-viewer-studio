import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Box,
  Braces,
  FileText,
  Code2,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const tools = [
  {
    id: "svg-viewer",
    title: "SVG Viewer Studio",
    description:
      "Preview, edit, and convert SVG files to React, React Native, Data URI. Download as PNG.",
    icon: <Box className="w-7 h-7" />,
    path: "/svg-viewer",
    ready: true,
    tag: "Live",
  },
  {
    id: "document-studio",
    title: "Document Studio",
    description:
      "Create, edit and manage documents with a professional rich text editor. All data stored locally.",
    icon: <FileText className="w-7 h-7" />,
    path: "/notes",
    ready: true,
    tag: "Live",
  },
  // {
  //   id: "code-snippets",
  //   title: "Code Snippet Manager",
  //   description:
  //     "Save, organize and search code snippets with syntax highlighting and tags.",
  //   icon: <Code2 className="w-7 h-7" />,
  //   path: "/code-snippets",
  //   ready: true,
  //   tag: "Live",
  // },
  // {
  //   id: "json-formatter",
  //   title: "JSON Formatter",
  //   description:
  //     "Format, validate and minify JSON with syntax highlighting and error detection.",
  //   icon: <Braces className="w-7 h-7" />,
  //   path: "/json-formatter",
  //   ready: false,
  //   tag: "Soon",
  // },
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
          Dev Tools <span className="text-primary">Studio</span>
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed mb-6">
          A collection of essential developer utilities. All tools run locally in your browser — no data leaves your machine.
        </p>
        {!user && (
          <button
            onClick={() => navigate('/sign-in')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <LogIn className="w-4 h-4" />
            Sign In to sync your data
          </button>
        )}
      </section>

      {/* Tools grid */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 pb-20">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm md:text-base font-semibold text-foreground uppercase tracking-wider">
            All Tools
          </h2>
          <span className="text-xs md:text-sm text-muted-foreground">
            {tools.filter((t) => t.ready).length} available · {tools.filter((t) => !t.ready).length} coming
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => tool.ready && navigate(tool.path)}
              disabled={!tool.ready}
              className={`group relative text-left p-6 rounded-xl border transition-all duration-200 outline-none ${
                tool.ready
                  ? "border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5   cursor-pointer"
                  : "border-border/50 bg-card/50 cursor-not-allowed opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    tool.ready
                      ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                      : "bg-muted text-muted-foreground/50"
                  }`}
                >
                  {tool.icon}
                </div>
                <span
                  className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    tool.ready
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground/60"
                  }`}
                >
                  {tool.tag}
                </span>
              </div>
              <h3
                className={`font-semibold text-base md:text-lg mb-1.5 ${tool.ready ? "text-foreground" : "text-muted-foreground"}`}
              >
                {tool.title}
              </h3>
              <p
                className={`text-sm leading-relaxed ${tool.ready ? "text-muted-foreground" : "text-muted-foreground/60"}`}
              >
                {tool.description}
              </p>
              {tool.ready && (
                <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Open tool <ArrowRight className="w-3.5 h-3.5" />
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
