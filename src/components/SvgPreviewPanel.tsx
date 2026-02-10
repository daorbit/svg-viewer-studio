import { useState, useRef, useCallback, useMemo } from "react";
import { Button, Tooltip, message } from "antd";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  DownloadOutlined,
  CopyOutlined,
  UploadOutlined,
  ExpandOutlined,
  CodeOutlined,
  EyeOutlined,
  FileImageOutlined,
  LinkOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import { SvgItem } from "@/data/sampleSvgs";
import SvgCodeEditor from "@/components/SvgCodeEditor";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

interface SvgPreviewPanelProps {
  selectedSvg: SvgItem | null;
  onUpload: (svg: string, name: string) => void;
  onSvgUpdate?: (id: string, newSvg: string) => void;
}

type BgType = "checker" | "white" | "dark" | "primary";
type CodeTab = "markup" | "react" | "react-native" | "data-uri";

const svgToReact = (svg: string): string => {
  let code = svg
    .replace(/xmlns="[^"]*"/g, "")
    .replace(/class="/g, 'className="')
    .replace(/fill-rule="/g, 'fillRule="')
    .replace(/clip-rule="/g, 'clipRule="')
    .replace(/stroke-width="/g, 'strokeWidth="')
    .replace(/stroke-linecap="/g, 'strokeLinecap="')
    .replace(/stroke-linejoin="/g, 'strokeLinejoin="')
    .replace(/fill-opacity="/g, 'fillOpacity="')
    .replace(/stroke-opacity="/g, 'strokeOpacity="')
    .replace(/stop-color="/g, 'stopColor="')
    .replace(/stop-opacity="/g, 'stopOpacity="');
  return `const SvgIcon = (props) => (\n  ${code}\n);\n\nexport default SvgIcon;`;
};

const svgToReactNative = (svg: string): string => {
  return `import Svg, { Path, Circle, Rect } from 'react-native-svg';\n\nconst SvgIcon = (props) => (\n  ${svg.replace("<svg", "<Svg").replace("</svg>", "</Svg>").replace(/<path/g, "<Path").replace(/<\/path>/g, "").replace(/<circle/g, "<Circle").replace(/<rect/g, "<Rect")}\n);\n\nexport default SvgIcon;`;
};

const svgToDataUri = (svg: string): string => {
  const encoded = encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22");
  return `data:image/svg+xml,${encoded}`;
};

const codeTabs: { key: CodeTab; label: string; icon: React.ReactNode }[] = [
  { key: "markup", label: "Markup", icon: <CodeOutlined /> },
  { key: "react", label: "React", icon: <CodeOutlined /> },
  { key: "react-native", label: "React Native", icon: <MobileOutlined /> },
  { key: "data-uri", label: "Data URI", icon: <LinkOutlined /> },
];

const SvgPreviewPanel = ({ selectedSvg, onUpload, onSvgUpdate }: SvgPreviewPanelProps) => {
  const [zoom, setZoom] = useState(100);
  const [bgType, setBgType] = useState<BgType>("checker");
  const [liveSvg, setLiveSvg] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<CodeTab>("markup");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSvg = liveSvg ?? selectedSvg?.svg ?? "";

  const handleCodeChange = useCallback((code: string) => {
    setLiveSvg(code);
    if (selectedSvg && onSvgUpdate) {
      onSvgUpdate(selectedSvg.id, code);
    }
  }, [selectedSvg, onSvgUpdate]);

  const [prevSelectedId, setPrevSelectedId] = useState<string | null>(null);
  if (selectedSvg?.id !== prevSelectedId) {
    setPrevSelectedId(selectedSvg?.id ?? null);
    setLiveSvg(null);
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success("Copied to clipboard!");
  };

  const handleDownloadSvg = () => {
    if (!selectedSvg) return;
    const blob = new Blob([currentSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedSvg.name}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = () => {
    if (!selectedSvg) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const svgBlob = new Blob([currentSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      canvas.width = img.width * 4 || 512;
      canvas.height = img.height * 4 || 512;
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `${selectedSvg.name}.png`;
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        onUpload(content, file.name.replace(".svg", ""));
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getBgStyle = (): React.CSSProperties => {
    switch (bgType) {
      case "checker":
        return {
          backgroundImage: "linear-gradient(45deg, hsl(228,12%,18%) 25%, transparent 25%), linear-gradient(-45deg, hsl(228,12%,18%) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(228,12%,18%) 75%), linear-gradient(-45deg, transparent 75%, hsl(228,12%,18%) 75%)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
          backgroundColor: "hsl(228, 15%, 14%)",
        };
      case "white": return { backgroundColor: "#ffffff" };
      case "dark": return { backgroundColor: "#0d0d0d" };
      case "primary": return { backgroundColor: "hsl(24, 30%, 15%)" };
      default: return { backgroundColor: "hsl(228, 15%, 14%)" };
    }
  };

  const bgButtons: { type: BgType; label: string; style: React.CSSProperties }[] = [
    { type: "checker", label: "Checkerboard", style: { background: "repeating-conic-gradient(hsl(228,12%,22%) 0% 25%, hsl(228,15%,14%) 0% 50%) 50% / 8px 8px" } },
    { type: "white", label: "White", style: { background: "#fff" } },
    { type: "dark", label: "Dark", style: { background: "#0d0d0d" } },
    { type: "primary", label: "Accent", style: { background: "hsl(var(--primary))" } },
  ];

  const displayedCode = useMemo(() => {
    switch (activeCodeTab) {
      case "markup": return currentSvg;
      case "react": return svgToReact(currentSvg);
      case "react-native": return svgToReactNative(currentSvg);
      case "data-uri": return svgToDataUri(currentSvg);
    }
  }, [activeCodeTab, currentSvg]);

  if (!selectedSvg) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6" style={{ background: "hsl(var(--editor-bg))" }}>
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-xl mx-auto mb-5 flex items-center justify-center"
            style={{ background: "hsl(var(--primary))", color: "#fff" }}>
            <UploadOutlined style={{ fontSize: 28 }} />
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: "hsl(var(--foreground))" }}>Welcome to SVGViewer</h2>
          <p className="text-sm mb-5" style={{ color: "hsl(var(--muted-foreground))" }}>
            Select an icon or upload an SVG file to get started.
          </p>
          <Button type="primary" icon={<UploadOutlined />} onClick={() => fileInputRef.current?.click()}
            style={{ background: "hsl(var(--primary))", borderColor: "hsl(var(--primary))", borderRadius: 4, fontWeight: 500 }}>
            Upload SVG
          </Button>
        </div>
        <input ref={fileInputRef} type="file" accept=".svg" className="hidden" onChange={handleFileUpload} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "hsl(var(--editor-bg))" }}>
      <input ref={fileInputRef} type="file" accept=".svg" className="hidden" onChange={handleFileUpload} />

      {/* Top action bar */}
      <div className="flex items-center justify-between px-3 py-1.5" style={{ background: "hsl(var(--titlebar-bg))", borderBottom: "1px solid hsl(var(--border))" }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "hsl(var(--accent))" }}
            dangerouslySetInnerHTML={{ __html: currentSvg }} />
          <span className="text-xs font-medium" style={{ color: "hsl(var(--foreground))" }}>{selectedSvg.name}.svg</span>
          <span className="text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>— {new Blob([currentSvg]).size}B</span>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip title="Copy SVG">
            <button onClick={() => handleCopy(currentSvg)} className="h-6 px-2 rounded text-[11px] flex items-center gap-1 hover:bg-white/10 transition-colors"
              style={{ color: "hsl(var(--muted-foreground))" }}>
              <CopyOutlined style={{ fontSize: 11 }} /> Copy
            </button>
          </Tooltip>
          <Tooltip title="Upload SVG">
            <button onClick={() => fileInputRef.current?.click()} className="h-6 px-2 rounded text-[11px] flex items-center gap-1 hover:bg-white/10 transition-colors"
              style={{ color: "hsl(var(--muted-foreground))" }}>
              <UploadOutlined style={{ fontSize: 11 }} /> Upload
            </button>
          </Tooltip>
          <button onClick={handleDownloadSvg} className="h-6 px-2.5 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
            style={{ background: "hsl(var(--primary))", color: "#fff" }}>
            <DownloadOutlined style={{ fontSize: 11 }} /> SVG
          </button>
          <button onClick={handleDownloadPng} className="h-6 px-2.5 rounded text-[11px] flex items-center gap-1 hover:bg-white/10 transition-colors"
            style={{ color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}>
            <FileImageOutlined style={{ fontSize: 11 }} /> PNG
          </button>
        </div>
      </div>

      {/* Main resizable area */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left: SVG Preview */}
        <ResizablePanel defaultSize={50} minSize={25}>
          <div className="h-full flex flex-col">
            {/* Preview mini toolbar */}
            <div className="flex items-center justify-between px-3 py-1" style={{ background: "hsl(var(--toolbar-bg))", borderBottom: "1px solid hsl(var(--border))" }}>
              <div className="flex items-center gap-1.5">
                <EyeOutlined style={{ color: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <span className="text-[11px] font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Preview</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setZoom(z => Math.max(z - 25, 25))} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
                  <ZoomOutOutlined style={{ color: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                </button>
                <span className="text-[10px] font-mono w-7 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>{zoom}%</span>
                <button onClick={() => setZoom(z => Math.min(z + 25, 400))} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
                  <ZoomInOutlined style={{ color: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                </button>
                <div className="w-px h-3 mx-0.5" style={{ background: "hsl(var(--border))" }} />
                <button onClick={() => setZoom(100)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
                  <ExpandOutlined style={{ color: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                </button>
                <div className="w-px h-3 mx-0.5" style={{ background: "hsl(var(--border))" }} />
                {bgButtons.map((bg) => (
                  <Tooltip key={bg.type} title={bg.label}>
                    <button onClick={() => setBgType(bg.type)}
                      className="w-4 h-4 rounded-full transition-all"
                      style={{
                        ...bg.style,
                        outline: bgType === bg.type ? "2px solid hsl(var(--primary))" : "1px solid hsl(var(--border))",
                        outlineOffset: bgType === bg.type ? 1 : 0,
                      }} />
                  </Tooltip>
                ))}
              </div>
            </div>
            {/* Preview canvas */}
            <div className="flex-1 flex items-center justify-center transition-colors duration-200" style={getBgStyle()}>
              <div style={{ width: `${zoom * 2.5}px`, height: `${zoom * 2.5}px`, transition: "width 0.2s, height 0.2s" }}
                dangerouslySetInnerHTML={{ __html: currentSvg }} />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right: Single code panel */}
        <ResizablePanel defaultSize={50} minSize={25}>
          <div className="h-full flex flex-col" style={{ background: "hsl(var(--editor-bg))" }}>
            {/* Code tab bar */}
            <div className="flex items-center" style={{ background: "hsl(var(--toolbar-bg))", borderBottom: "1px solid hsl(var(--border))" }}>
              {codeTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveCodeTab(tab.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium whitespace-nowrap transition-colors border-r"
                  style={{
                    color: activeCodeTab === tab.key ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                    background: activeCodeTab === tab.key ? "hsl(var(--editor-bg))" : "transparent",
                    borderColor: "hsl(var(--border))",
                    borderBottom: activeCodeTab === tab.key ? "1px solid hsl(var(--editor-bg))" : "1px solid hsl(var(--border))",
                    marginBottom: -1,
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
              <div className="flex-1" />
              <Tooltip title="Copy code">
                <button onClick={() => handleCopy(displayedCode)}
                  className="w-6 h-6 mr-2 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
                  <CopyOutlined style={{ color: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                </button>
              </Tooltip>
            </div>

            {/* Code content — single panel, content switches */}
            {activeCodeTab === "markup" ? (
              <SvgCodeEditor svgCode={selectedSvg.svg} onCodeChange={handleCodeChange} />
            ) : (
              <div className="flex-1 flex overflow-hidden" style={{ background: "hsl(var(--editor-bg))" }}>
                <div className="select-none py-3 px-2 text-right overflow-hidden"
                  style={{ fontFamily: "'SF Mono', 'Fira Code', Menlo, Consolas, monospace", fontSize: 13, lineHeight: "1.6", color: "hsl(var(--editor-gutter))", minWidth: 40 }}>
                  {displayedCode.split("\n").map((_, i) => <div key={i}>{i + 1}</div>)}
                </div>
                <pre className="flex-1 overflow-auto py-3 px-2 m-0 whitespace-pre-wrap"
                  style={{ fontFamily: "'SF Mono', 'Fira Code', Menlo, Consolas, monospace", fontSize: 13, lineHeight: "1.6", color: "#abb2bf", background: "transparent" }}>
                  <code>{displayedCode}</code>
                </pre>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3" style={{ height: 22, background: "hsl(var(--statusbar-bg))" }}>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium" style={{ color: "#fff" }}>{selectedSvg.name}.svg</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.8)" }}>Ln {currentSvg.split("\n").length}</span>
          <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.8)" }}>SVG</span>
        </div>
      </div>
    </div>
  );
};

export default SvgPreviewPanel;
