import { useState, useRef, useCallback, useMemo } from "react";
import { Tooltip, message } from "antd";
import {
  ZoomIn,
  ZoomOut,
  Download,
  Copy,
  Upload,
  Expand,
  Code,
  Eye,
  FileImage,
  Link,
  Smartphone,
} from "lucide-react";
import { SvgItem } from "@/data/sampleSvgs";
import SvgCodeEditor from "@/components/SvgCodeEditor";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

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
  return `import Svg, { Path, Circle, Rect } from 'react-native-svg';\n\nconst SvgIcon = (props) => (\n  ${svg
    .replace("<svg", "<Svg")
    .replace("</svg>", "</Svg>")
    .replace(/<path/g, "<Path")
    .replace(/<\/path>/g, "")
    .replace(/<circle/g, "<Circle")
    .replace(/<rect/g, "<Rect")}\n);\n\nexport default SvgIcon;`;
};

const svgToDataUri = (svg: string): string => {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `data:image/svg+xml,${encoded}`;
};

const codeTabs: { key: CodeTab; label: string; icon: React.ReactNode }[] = [
  { key: "markup", label: "Markup", icon: <Code className="w-3 h-3" /> },
  { key: "react", label: "React", icon: <Code className="w-3 h-3" /> },
  {
    key: "react-native",
    label: "React Native",
    icon: <Smartphone className="w-3 h-3" />,
  },
  { key: "data-uri", label: "Data URI", icon: <Link className="w-3 h-3" /> },
];

const SvgPreviewPanel = ({
  selectedSvg,
  onUpload,
  onSvgUpdate,
}: SvgPreviewPanelProps) => {
  const [zoom, setZoom] = useState(100);
  const [bgType, setBgType] = useState<BgType>("checker");
  const [liveSvg, setLiveSvg] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<CodeTab>("markup");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSvg = liveSvg ?? selectedSvg?.svg ?? "";

  const handleCodeChange = useCallback(
    (code: string) => {
      setLiveSvg(code);
      if (selectedSvg && onSvgUpdate) {
        onSvgUpdate(selectedSvg.id, code);
      }
    },
    [selectedSvg, onSvgUpdate],
  );

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
          backgroundImage:
            "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
          backgroundColor: "#f9fafb",
        };
      case "white":
        return { backgroundColor: "#ffffff" };
      case "dark":
        return { backgroundColor: "#1e1e2e" };
      case "primary":
        return { backgroundColor: "hsl(24, 95%, 95%)" };
      default:
        return { backgroundColor: "#f9fafb" };
    }
  };

  const bgButtons: {
    type: BgType;
    label: string;
    style: React.CSSProperties;
  }[] = [
    {
      type: "checker",
      label: "Checkerboard",
      style: {
        background:
          "repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%) 50% / 8px 8px",
      },
    },
    { type: "white", label: "White", style: { background: "#fff" } },
    { type: "dark", label: "Dark", style: { background: "#1e1e2e" } },
    {
      type: "primary",
      label: "Accent",
      style: { background: "hsl(var(--primary))" },
    },
  ];

  const displayedCode = useMemo(() => {
    switch (activeCodeTab) {
      case "markup":
        return currentSvg;
      case "react":
        return svgToReact(currentSvg);
      case "react-native":
        return svgToReactNative(currentSvg);
      case "data-uri":
        return svgToDataUri(currentSvg);
    }
  }, [activeCodeTab, currentSvg]);

  if (!selectedSvg) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-background">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-xl mx-auto mb-5 flex items-center justify-center bg-primary text-primary-foreground">
            <Upload className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-semibold mb-2 text-foreground">
            Welcome to SVG Viewer Studio
          </h2>
          <p className="text-sm mb-5 text-muted-foreground">
            Select an icon or upload an SVG file to get started.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" /> Upload SVG
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Top action bar - light */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded flex items-center justify-center bg-accent"
            dangerouslySetInnerHTML={{ __html: currentSvg }}
          />
          <span className="text-xs font-medium text-foreground">
            {selectedSvg.name}.svg
          </span>
          <span className="text-[11px] text-muted-foreground">
            — {new Blob([currentSvg]).size}B
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip title="Upload SVG">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-6 px-2 rounded text-[11px] flex items-center gap-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Upload className="w-3 h-3" /> Upload
            </button>
          </Tooltip>
          <button
            onClick={handleDownloadSvg}
            className="h-6 px-2.5 rounded text-[11px] font-medium flex items-center gap-1 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Download className="w-3 h-3" /> SVG
          </button>
          <button
            onClick={handleDownloadPng}
            className="h-6 px-2.5 rounded text-[11px] flex items-center gap-1 text-muted-foreground border border-border hover:bg-accent transition-colors"
          >
            <FileImage className="w-3 h-3" /> PNG
          </button>
        </div>
      </div>

      {/* Main resizable area */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left: SVG Preview - LIGHT */}
        <ResizablePanel defaultSize={50} minSize={25}>
          <div className="h-full flex flex-col bg-background">
            {/* Preview mini toolbar */}
            <div className="flex items-center justify-between px-3 py-1 bg-card border-b border-border">
              <div className="flex items-center gap-1.5">
                <Eye className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  Preview
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoom((z) => Math.max(z - 25, 25))}
                  className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <span className="text-[10px] font-mono w-7 text-center text-muted-foreground">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(z + 25, 400))}
                  className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
                <div className="w-px h-3 mx-0.5 bg-border" />
                <button
                  onClick={() => setZoom(100)}
                  className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors"
                >
                  <Expand className="w-3 h-3" />
                </button>
                <div className="w-px h-3 mx-0.5 bg-border" />
                {bgButtons.map((bg) => (
                  <Tooltip key={bg.type} title={bg.label}>
                    <button
                      onClick={() => setBgType(bg.type)}
                      className="w-4 h-4 rounded-full transition-all"
                      style={{
                        ...bg.style,
                        outline:
                          bgType === bg.type
                            ? "2px solid hsl(var(--primary))"
                            : "1px solid hsl(var(--border))",
                        outlineOffset: bgType === bg.type ? 1 : 0,
                      }}
                    />
                  </Tooltip>
                ))}
              </div>
            </div>
            {/* Preview canvas */}
            <div
              className="flex-1 flex items-center justify-center transition-colors duration-200"
              style={getBgStyle()}
            >
              <div
                style={{
                  width: `${zoom * 2.5}px`,
                  height: `${zoom * 2.5}px`,
                  transition: "width 0.2s, height 0.2s",
                }}
                dangerouslySetInnerHTML={{ __html: currentSvg }}
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right: Code panel - DARK VS Code */}
        <ResizablePanel defaultSize={50} minSize={25}>
          <div
            className="h-full flex flex-col"
            style={{ background: "hsl(var(--editor-bg))" }}
          >
            {/* Code tab bar - dark */}
            <div
              className="flex items-center"
              style={{
                background: "hsl(228, 15%, 17%)",
                borderBottom: "1px solid hsl(228, 12%, 22%)",
              }}
            >
              {codeTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveCodeTab(tab.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium whitespace-nowrap transition-colors"
                  style={{
                    color: activeCodeTab === tab.key ? "#d4d4d4" : "#808080",
                    background:
                      activeCodeTab === tab.key
                        ? "hsl(228, 15%, 14%)"
                        : "transparent",
                    borderRight: "1px solid hsl(228, 12%, 22%)",
                    borderBottom:
                      activeCodeTab === tab.key
                        ? "1px solid hsl(228, 15%, 14%)"
                        : "1px solid hsl(228, 12%, 22%)",
                    marginBottom: -1,
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
              <div className="flex-1" />
            </div>

            {/* Code content — single panel, dark */}
            {activeCodeTab === "markup" ? (
              <SvgCodeEditor
                svgCode={selectedSvg.svg}
                onCodeChange={handleCodeChange}
              />
            ) : (
              <div
                className="flex-1 flex overflow-hidden"
                style={{ background: "hsl(var(--editor-bg))" }}
              >
                <div
                  className="select-none py-3 px-2 text-right overflow-hidden"
                  style={{
                    fontFamily:
                      "'SF Mono', 'Fira Code', Menlo, Consolas, monospace",
                    fontSize: 13,
                    lineHeight: "1.6",
                    color: "hsl(228, 9%, 35%)",
                    minWidth: 40,
                  }}
                >
                  {displayedCode.split("\n").map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <pre
                  className="flex-1 overflow-auto py-3 px-2 m-0 whitespace-pre-wrap"
                  style={{
                    fontFamily:
                      "'SF Mono', 'Fira Code', Menlo, Consolas, monospace",
                    fontSize: 13,
                    lineHeight: "1.6",
                    color: "#abb2bf",
                    background: "transparent",
                  }}
                >
                  <code>{displayedCode}</code>
                </pre>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Status bar */}
      <div
        className="flex items-center justify-between px-3"
        style={{ height: 22, background: "hsl(var(--statusbar-bg))" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium text-primary-foreground">
            {selectedSvg.name}.svg
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-[11px]"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            Ln {currentSvg.split("\n").length}
          </span>
          <span
            className="text-[11px]"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            SVG
          </span>
        </div>
      </div>
    </div>
  );
};

export default SvgPreviewPanel;
