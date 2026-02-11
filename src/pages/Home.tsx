import { useNavigate } from "react-router-dom";
import { ArrowRight, Box, Image, Braces, FileText, Clock, Code2, Send } from "lucide-react";

const tools = [
  {
    id: "svg-viewer",
    title: "SVG Viewer Studio",
    description: "Preview, edit, and convert SVG files to React, React Native, Data URI. Download as PNG.",
    icon: <Box className="w-6 h-6" />,
    path: "/svg-viewer",
    ready: true,
    tag: "Live",
  },
 
  {
    id: "notes-manager",
    title: "Notes Manager",
    description: "Create, edit and manage notes with a professional rich text editor. All data stored locally.",
    icon: <FileText className="w-6 h-6" />,
    path: "/notes",
    ready: true,
    tag: "Live",
  },

  {
    id: "datetime-tools",
    title: "Date & Time Tools",
    description: "Convert timestamps, calculate date differences, work with timezones and more.",
    icon: <Clock className="w-6 h-6" />,
    path: "/datetime-tools",
    ready: true,
    tag: "Live",
  },

  {
    id: "code-snippets",
    title: "Code Snippet Manager",
    description: "Save, organize and search code snippets with syntax highlighting and tags.",
    icon: <Code2 className="w-6 h-6" />,
    path: "/code-snippets",
    ready: true,
    tag: "Live",
  },

  {
    id: "api-tester",
    title: "HTTP/API Tester",
    description: "Test REST APIs with custom headers, request bodies and view formatted responses.",
    icon: <Send className="w-6 h-6" />,
    path: "/api-tester",
    ready: true,
    tag: "Live",
  },
 
  {
    id: "image-converter",
    title: "Image Converter",
    description: "Convert, resize, compress and optimize images for the web in multiple formats.",
    icon: <Image className="w-6 h-6" />,
    path: "/image-converter",
    ready: false,
    tag: "Soon",
  },
 
  {
    id: "json-formatter",
    title: "JSON Formatter",
    description: "Format, validate and minify JSON with syntax highlighting and error detection.",
    icon: <Braces className="w-6 h-6" />,
    path: "/json-formatter",
    ready: false,
    tag: "Soon",
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-primary-foreground">
              <Box className="w-4 h-4" />
            </div>
            <span className="font-bold text-base text-foreground tracking-tight">
              Dev<span className="text-primary">Tools</span>
            </span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub →
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Free & open source
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-[1.1] max-w-xl">
            Developer tools,
            <br />
            <span className="text-primary">zero friction.</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground max-w-md leading-relaxed">
            A growing collection of utilities built for developers. Fast, private, and works right in your browser.
          </p>
          <button
            onClick={() => navigate("/svg-viewer")}
            className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm shadow-primary/20"
          >
            Open SVG Viewer <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </section>

      {/* Tools grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">All Tools</h2>
          <span className="text-xs text-muted-foreground">{tools.filter(t => t.ready).length} available · {tools.filter(t => !t.ready).length} coming</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => tool.ready && navigate(tool.path)}
              disabled={!tool.ready}
              className={`group relative text-left p-5 rounded-xl border transition-all duration-200 outline-none ${
                tool.ready
                  ? "border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 cursor-pointer"
                  : "border-border/50 bg-card/50 cursor-not-allowed"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  tool.ready
                    ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                    : "bg-muted text-muted-foreground/50"
                }`}>
                  {tool.icon}
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  tool.ready
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-muted text-muted-foreground/60"
                }`}>
                  {tool.tag}
                </span>
              </div>
              <h3 className={`font-semibold text-sm mb-1 ${tool.ready ? "text-foreground" : "text-muted-foreground"}`}>
                {tool.title}
              </h3>
              <p className={`text-xs leading-relaxed ${tool.ready ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
                {tool.description}
              </p>
              {tool.ready && (
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Open tool <ArrowRight className="w-2.5 h-2.5" />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">© 2026 DevTools. Built for developers.</span>
          <span className="text-xs text-muted-foreground">All tools run locally in your browser.</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;