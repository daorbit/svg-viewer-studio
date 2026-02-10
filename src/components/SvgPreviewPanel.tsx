import { useState, useRef, useCallback, useMemo } from "react";
import { Button, Tooltip, message, Slider } from "antd";
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
  FormatPainterOutlined,
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
          backgroundImage: "linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
          backgroundColor: "white",
        };
      case "white": return { backgroundColor: "white" };
      case "dark": return { backgroundColor: "#1a1a2e" };
      case "primary": return { backgroundColor: "hsl(24, 100%, 97%)" };
      default: return { backgroundColor: "white" };
    }
  };

  const bgButtons: { type: BgType; label: string; style: React.CSSProperties }[] = [
    { type: "checker", label: "Checkerboard", style: { background: "repeating-conic-gradient(#e0e0e0 0% 25%, white 0% 50%) 50% / 10px 10px" } },
    { type: "white", label: "White", style: { background: "#fff", border: "1px solid hsl(var(--border))" } },
    { type: "dark", label: "Dark", style: { background: "#1a1a2e" } },
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
      <div className="flex-1 flex flex-col items-center justify-center gap-6" style={{ background: "#fafafa" }}>
        <div className="text-center max-w-sm">
          <div
            className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(24, 95%, 42%))", color: "hsl(var(--primary-foreground))" }}
          >
            <UploadOutlined style={{ fontSize: 32 }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "hsl(var(--foreground))" }}>Welcome to SVGViewer</h2>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
            Select an icon from the sidebar, or upload your own SVG file to preview, edit, and convert.
          </p>
          <Button type="primary" size="large" icon={<UploadOutlined />} onClick={() => fileInputRef.current?.click()}
            style={{ background: "hsl(var(--primary))", borderColor: "hsl(var(--primary))", borderRadius: 10, height: 44, paddingInline: 28, fontWeight: 600 }}>
            Upload SVG File
          </Button>
        </div>
        <input ref={fileInputRef} type="file" accept=".svg" className="hidden" onChange={handleFileUpload} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#1e1e2e" }}>
      <input ref={fileInputRef} type="file" accept=".svg" className="hidden" onChange={handleFileUpload} />

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: "#2d2d3d", background: "#252536" }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: "#2d2d3d" }}
            dangerouslySetInnerHTML={{ __html: currentSvg }} />
          <div>
            <h2 className="text-sm font-semibold leading-none" style={{ color: "#e0e0e0" }}>{selectedSvg.name}</h2>
            <p className="text-[11px] mt-0.5" style={{ color: "#888" }}>{new Blob([currentSvg]).size} bytes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="small" icon={<CopyOutlined />} onClick={() => handleCopy(currentSvg)}
            style={{ borderRadius: 4, background: "#2d2d3d", borderColor: "#3d3d4d", color: "#ccc" }}>Copy SVG</Button>
          <Button size="small" icon={<UploadOutlined />} onClick={() => fileInputRef.current?.click()}
            style={{ borderRadius: 4, background: "#2d2d3d", borderColor: "#3d3d4d", color: "#ccc" }}>Upload</Button>
          <Button size="small" icon={<DownloadOutlined />} onClick={handleDownloadSvg}
            style={{ background: "hsl(var(--primary))", borderColor: "hsl(var(--primary))", borderRadius: 4, fontWeight: 500, color: "#fff" }}>Download SVG</Button>
          <Button size="small" icon={<FileImageOutlined />} onClick={handleDownloadPng}
            style={{ borderRadius: 4, background: "#2d2d3d", borderColor: "#3d3d4d", color: "#ccc" }}>PNG</Button>
        </div>
      </div>

      {/* Main content: resizable preview + code */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left: SVG Preview */}
        <ResizablePanel defaultSize={50} minSize={25}>
          <div className="h-full flex flex-col">
            {/* Preview toolbar */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b" style={{ borderColor: "#2d2d3d", background: "#252536" }}>
              <div className="flex items-center gap-2">
                <EyeOutlined style={{ color: "#888", fontSize: 12 }} />
                <span className="text-xs font-medium" style={{ color: "#aaa" }}>Preview</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Tooltip title="Zoom out">
                  <button onClick={() => setZoom(z => Math.max(z - 25, 25))} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
                    <ZoomOutOutlined style={{ color: "#888", fontSize: 12 }} />
                  </button>
                </Tooltip>
                <span className="text-[11px] font-mono min-w-[32px] text-center" style={{ color: "#888" }}>{zoom}%</span>
                <Tooltip title="Zoom in">
                  <button onClick={() => setZoom(z => Math.min(z + 25, 400))} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
                    <ZoomInOutlined style={{ color: "#888", fontSize: 12 }} />
                  </button>
                </Tooltip>
                <div className="w-px h-3 mx-1" style={{ background: "#3d3d4d" }} />
                <Tooltip title="Fit to screen">
                  <button onClick={() => setZoom(100)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
                    <ExpandOutlined style={{ color: "#888", fontSize: 12 }} />
                  </button>
                </Tooltip>
                <div className="w-px h-3 mx-1" style={{ background: "#3d3d4d" }} />
                {bgButtons.map((bg) => (
                  <Tooltip key={bg.type} title={bg.label}>
                    <button onClick={() => setBgType(bg.type)}
                      className="w-4 h-4 rounded-full transition-all"
                      style={{
                        ...bg.style,
                        outline: bgType === bg.type ? "2px solid hsl(var(--primary))" : "1px solid #3d3d4d",
                        outlineOffset: bgType === bg.type ? 1 : 0,
                      }} />
                  </Tooltip>
                ))}
              </div>
            </div>
            {/* Preview area */}
            <div className="flex-1 flex items-center justify-center transition-colors duration-200" style={getBgStyle()}>
              <div
                style={{ width: `${zoom * 2.5}px`, height: `${zoom * 2.5}px`, transition: "width 0.2s ease, height 0.2s ease" }}
                dangerouslySetInnerHTML={{ __html: currentSvg }}
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right: Code panel with tabs */}
        <ResizablePanel defaultSize={50} minSize={25}>
          <div className="h-full flex flex-col" style={{ background: "#1e1e2e" }}>
            {/* Code tabs bar */}
            <div className="flex items-center border-b" style={{ borderColor: "#2d2d3d", background: "#252536" }}>
              <div className="flex-1 flex items-center overflow-x-auto">
                {codeTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveCodeTab(tab.key)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2"
                    style={{
                      color: activeCodeTab === tab.key ? "#e0e0e0" : "#666",
                      borderBottomColor: activeCodeTab === tab.key ? "hsl(var(--primary))" : "transparent",
                      background: activeCodeTab === tab.key ? "#1e1e2e" : "transparent",
                    }}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 px-2">
                <Tooltip title="Copy code">
                  <button onClick={() => handleCopy(displayedCode)}
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
                    <CopyOutlined style={{ color: "#888", fontSize: 13 }} />
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Code content */}
            {activeCodeTab === "markup" ? (
              <SvgCodeEditor svgCode={selectedSvg.svg} onCodeChange={handleCodeChange} />
            ) : (
              <div className="flex-1 flex overflow-hidden" style={{ background: "#1e1e2e" }}>
                <div className="select-none py-3 px-2 text-right overflow-hidden"
                  style={{ fontFamily: "'SF Mono', 'Fira Code', Menlo, Consolas, monospace", fontSize: 13, lineHeight: "1.6", color: "#5c6370", minWidth: 40 }}>
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
      <div className="flex items-center justify-between px-3 py-1" style={{ borderTop: "1px solid #2d2d3d", background: "hsl(var(--primary))" }}>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium" style={{ color: "#fff" }}>
            {selectedSvg.name}.svg
          </span>
          <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>
            {new Blob([currentSvg]).size} B
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>
            {currentSvg.split("\n").length} lines
          </span>
          <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>
            SVG
          </span>
        </div>
      </div>
    </div>
  );
};

export default SvgPreviewPanel;
