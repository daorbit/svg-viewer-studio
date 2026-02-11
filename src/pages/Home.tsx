import { useNavigate } from "react-router-dom";

const tools = [
  {
    id: "svg-viewer",
    title: "SVG Viewer",
    description: "Preview, edit, and convert SVG files. Export to React, React Native, Data URI, and PNG.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
        <line x1="12" y1="22" x2="12" y2="15.5" />
        <polyline points="22 8.5 12 15.5 2 8.5" />
      </svg>
    ),
    path: "/svg-viewer",
    ready: true,
  },
  {
    id: "color-palette",
    title: "Color Palette",
    description: "Generate beautiful color palettes, convert between formats, and check contrast ratios.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="10.5" r="2.5" />
        <circle cx="8.5" cy="7.5" r="2.5" />
        <circle cx="6.5" cy="12.5" r="2.5" />
        <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-1.5 4-3 4h-1.8c-.8 0-1.5.7-1.5 1.5 0 .4.2.8.4 1.1.3.3.4.6.4 1 0 .8-.7 1.4-1.5 1.4" />
      </svg>
    ),
    path: "/color-palette",
    ready: false,
  },
  {
    id: "css-generator",
    title: "CSS Generator",
    description: "Generate CSS gradients, shadows, borders, and animations with live preview.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="14" y1="4" x2="10" y2="20" />
      </svg>
    ),
    path: "/css-generator",
    ready: false,
  },
  {
    id: "image-converter",
    title: "Image Converter",
    description: "Convert images between formats, resize, compress, and optimize for the web.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    path: "/image-converter",
    ready: false,
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary text-primary-foreground">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
              <line x1="12" y1="22" x2="12" y2="15.5" />
              <polyline points="22 8.5 12 15.5 2 8.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              Dev<span className="text-primary">Tools</span>
            </h1>
            <p className="text-[11px] text-muted-foreground -mt-0.5">Developer utilities in one place</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-10">
        <h2 className="text-3xl font-bold text-foreground tracking-tight">
          Your everyday <span className="text-primary">dev tools</span>
        </h2>
        <p className="mt-2 text-muted-foreground max-w-lg">
          A growing collection of free developer utilities. No sign-up, no bloat — just tools that work.
        </p>
      </section>

      {/* Tool grid */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => tool.ready && navigate(tool.path)}
              disabled={!tool.ready}
              className={`group text-left p-5 rounded-xl border transition-all duration-200 ${
                tool.ready
                  ? "border-border bg-card hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 cursor-pointer"
                  : "border-border/60 bg-muted/30 cursor-not-allowed opacity-60"
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                tool.ready
                  ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  : "bg-muted text-muted-foreground"
              }`}>
                {tool.icon}
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="font-semibold text-foreground text-sm">{tool.title}</h3>
                {!tool.ready && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                    Coming Soon
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;