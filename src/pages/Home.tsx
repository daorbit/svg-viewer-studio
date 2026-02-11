import { useNavigate } from "react-router-dom";
import { ArrowRightOutlined } from "@ant-design/icons";

const tools = [
  {
    id: "svg-viewer",
    title: "SVG Viewer Studio",
    description: "Preview, edit, and convert SVG files to React, React Native, Data URI. Download as PNG.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
        <line x1="12" y1="22" x2="12" y2="15.5" />
        <polyline points="22 8.5 12 15.5 2 8.5" />
      </svg>
    ),
    path: "/svg-viewer",
    ready: true,
    tag: "Live",
  },
  {
    id: "color-palette",
    title: "Color Palette",
    description: "Generate palettes, convert between HEX, RGB, HSL and check contrast ratios.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="10.5" r="2.5" />
        <circle cx="8.5" cy="7.5" r="2.5" />
        <circle cx="6.5" cy="12.5" r="2.5" />
        <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-1.5 4-3 4h-1.8c-.8 0-1.5.7-1.5 1.5 0 .4.2.8.4 1.1.3.3.4.6.4 1 0 .8-.7 1.4-1.5 1.4" />
      </svg>
    ),
    path: "/color-palette",
    ready: false,
    tag: "Soon",
  },
  {
    id: "css-generator",
    title: "CSS Generator",
    description: "Create gradients, shadows, borders and animations with live preview and copy-paste code.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="14" y1="4" x2="10" y2="20" />
      </svg>
    ),
    path: "/css-generator",
    ready: false,
    tag: "Soon",
  },
  {
    id: "image-converter",
    title: "Image Converter",
    description: "Convert, resize, compress and optimize images for the web in multiple formats.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    path: "/image-converter",
    ready: false,
    tag: "Soon",
  },
  {
    id: "base64",
    title: "Base64 Encoder",
    description: "Encode and decode text, images and files to Base64 format instantly.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01" />
      </svg>
    ),
    path: "/base64",
    ready: false,
    tag: "Soon",
  },
  {
    id: "json-formatter",
    title: "JSON Formatter",
    description: "Format, validate and minify JSON with syntax highlighting and error detection.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1" />
        <path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" />
      </svg>
    ),
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                <line x1="12" y1="22" x2="12" y2="15.5" />
                <polyline points="22 8.5 12 15.5 2 8.5" />
              </svg>
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
            Open SVG Viewer <ArrowRightOutlined style={{ fontSize: 12 }} />
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
                  Open tool <ArrowRightOutlined style={{ fontSize: 10 }} />
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