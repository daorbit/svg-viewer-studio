import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Box,
  Image,
  Braces,
  FileText,
  Clock,
  Code2,
  Send,
} from "lucide-react";

const tools = [
  {
    id: "svg-viewer",
    title: "SVG Viewer Studio",
    description:
      "Preview, edit, and convert SVG files to React, React Native, Data URI. Download as PNG.",
    icon: <Box className="w-6 h-6" />,
    path: "/svg-viewer",
    ready: true,
    tag: "Live",
  },

  {
    id: "notes-manager",
    title: "Notes Manager",
    description:
      "Create, edit and manage notes with a professional rich text editor. All data stored locally.",
    icon: <FileText className="w-6 h-6" />,
    path: "/notes",
    ready: true,
    tag: "Live",
  },

  {
    id: "datetime-tools",
    title: "Date & Time Tools",
    description:
      "Convert timestamps, calculate date differences, work with timezones and more.",
    icon: <Clock className="w-6 h-6" />,
    path: "/datetime-tools",
    ready: true,
    tag: "Live",
  },

  {
    id: "code-snippets",
    title: "Code Snippet Manager",
    description:
      "Save, organize and search code snippets with syntax highlighting and tags.",
    icon: <Code2 className="w-6 h-6" />,
    path: "/code-snippets",
    ready: true,
    tag: "Live",
  },

  // {
  //   id: "api-tester",
  //   title: "HTTP/API Tester",
  //   description: "Test REST APIs with custom headers, request bodies and view formatted responses.",
  //   icon: <Send className="w-6 h-6" />,
  //   path: "/api-tester",
  //   ready: true,
  //   tag: "Live",
  // },

  {
    id: "image-converter",
    title: "Image Converter",
    description:
      "Convert, resize, compress and optimize images for the web in multiple formats.",
    icon: <Image className="w-6 h-6" />,
    path: "/image-converter",
    ready: false,
    tag: "Soon",
  },

  {
    id: "json-formatter",
    title: "JSON Formatter",
    description:
      "Format, validate and minify JSON with syntax highlighting and error detection.",
    icon: <Braces className="w-6 h-6" />,
    path: "/json-formatter",
    ready: false,
    tag: "Soon",
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className=" bg-background">
      {/* Tools grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24 pt-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            All Tools
          </h2>
          <span className="text-xs text-muted-foreground">
            {tools.filter((t) => t.ready).length} available ·{" "}
            {tools.filter((t) => !t.ready).length} coming
          </span>
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
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    tool.ready
                      ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                      : "bg-muted text-muted-foreground/50"
                  }`}
                >
                  {tool.icon}
                </div>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    tool.ready
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-muted text-muted-foreground/60"
                  }`}
                >
                  {tool.tag}
                </span>
              </div>
              <h3
                className={`font-semibold text-sm mb-1 ${tool.ready ? "text-foreground" : "text-muted-foreground"}`}
              >
                {tool.title}
              </h3>
              <p
                className={`text-xs leading-relaxed ${tool.ready ? "text-muted-foreground" : "text-muted-foreground/60"}`}
              >
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
    </div>
  );
};

export default Home;
