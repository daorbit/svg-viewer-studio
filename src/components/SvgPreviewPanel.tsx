import { useState, useRef, useCallback } from "react";
import { Tabs, Button, Tooltip, message, Slider } from "antd";
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

const SvgPreviewPanel = ({ selectedSvg, onUpload, onSvgUpdate }: SvgPreviewPanelProps) => {
  const [zoom, setZoom] = useState(100);
  const [bgType, setBgType] = useState<BgType>("checker");
  const [liveSvg, setLiveSvg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSvg = liveSvg ?? selectedSvg?.svg ?? "";

  const handleCodeChange = useCallback((code: string) => {
    setLiveSvg(code);
    if (selectedSvg && onSvgUpdate) {
      onSvgUpdate(selectedSvg.id, code);
    }
  }, [selectedSvg, onSvgUpdate]);

  // Reset live SVG when selection changes
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
    {
      type: "checker", label: "Checkerboard",
      style: { background: "repeating-conic-gradient(#e0e0e0 0% 25%, white 0% 50%) 50% / 10px 10px" },
    },
    { type: "white", label: "White", style: { background: "#fff", border: "1px solid hsl(var(--border))" } },
    { type: "dark", label: "Dark", style: { background: "#1a1a2e" } },
    { type: "primary", label: "Accent", style: { background: "hsl(var(--primary))" } },
  ];

  if (!selectedSvg) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6" style={{ background: "#fafafa" }}>
        <div className="text-center max-w-sm">
          <div
            className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(24, 95%, 42%))",
              color: "hsl(var(--primary-foreground))",
            }}
          >
            <UploadOutlined style={{ fontSize: 32 }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "hsl(var(--foreground))" }}>
            Welcome to SVGViewer
          </h2>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
            Select an icon from the sidebar, or upload your own SVG file to preview, edit, and convert.
          </p>
          <Button
            type="primary"
            size="large"
            icon={<UploadOutlined />}
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: "hsl(var(--primary))",
              borderColor: "hsl(var(--primary))",
              borderRadius: 10,
              height: 44,
              paddingInline: 28,
              fontWeight: 600,
            }}
          >
            Upload SVG File
          </Button>
        </div>
        <input ref={fileInputRef} type="file" accept=".svg" className="hidden" onChange={handleFileUpload} />
      </div>
    );
  }

  const codeBlock = (code: string, wrap = false) => (
    <div className="flex-1 flex flex-col">
      <div className="flex justify-end items-center px-3 py-1.5 border-b" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--toolbar-bg))" }}>
        <Tooltip title="Copy code">
          <Button size="small" type="text" icon={<CopyOutlined />} onClick={() => handleCopy(code)}>
            Copy
          </Button>
        </Tooltip>
      </div>
      <pre
        className={`svg-code-block flex-1 overflow-auto p-4 m-0 ${wrap ? "break-all whitespace-pre-wrap" : ""}`}
        style={{ background: "#1e1e2e", color: "#abb2bf" }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );

  const tabItems = [
    {
      key: "preview",
      label: <span className="flex items-center gap-1.5"><EyeOutlined />Preview</span>,
      children: (
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={55} minSize={30}>
            <div className="h-full flex items-center justify-center p-8 transition-colors duration-200" style={getBgStyle()}>
              <div
                style={{
                  width: `${zoom * 2.5}px`,
                  height: `${zoom * 2.5}px`,
                  transition: "width 0.2s ease, height 0.2s ease",
                }}
                dangerouslySetInnerHTML={{ __html: currentSvg }}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={45} minSize={25}>
            <SvgCodeEditor svgCode={selectedSvg.svg} onCodeChange={handleCodeChange} />
          </ResizablePanel>
        </ResizablePanelGroup>
      ),
    },
    {
      key: "react",
      label: <span className="flex items-center gap-1.5"><CodeOutlined />React</span>,
      children: codeBlock(svgToReact(currentSvg)),
    },
    {
      key: "react-native",
      label: <span className="flex items-center gap-1.5"><MobileOutlined />React Native</span>,
      children: codeBlock(svgToReactNative(currentSvg)),
    },
    {
      key: "png",
      label: <span className="flex items-center gap-1.5"><FileImageOutlined />PNG</span>,
      children: (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8" style={{ background: "#fafafa" }}>
          <div
            className="w-52 h-52 flex items-center justify-center rounded-xl"
            style={getBgStyle()}
            dangerouslySetInnerHTML={{ __html: currentSvg }}
          />
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadPng}
            size="large"
            style={{
              background: "hsl(var(--primary))",
              borderColor: "hsl(var(--primary))",
              borderRadius: 10,
              fontWeight: 600,
            }}
          >
            Download PNG
          </Button>
        </div>
      ),
    },
    {
      key: "data-uri",
      label: <span className="flex items-center gap-1.5"><LinkOutlined />Data URI</span>,
      children: codeBlock(svgToDataUri(currentSvg), true),
    },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "white" }}>
      <input ref={fileInputRef} type="file" accept=".svg" className="hidden" onChange={handleFileUpload} />

      {/* Header with name */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b"
        style={{ borderColor: "hsl(var(--border))" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#f5f5f5" }}
            dangerouslySetInnerHTML={{ __html: currentSvg }}
          />
          <div>
            <h2 className="text-sm font-semibold leading-none" style={{ color: "hsl(var(--foreground))" }}>
              {selectedSvg.name}
            </h2>
            <p className="text-[11px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
              {new Blob([currentSvg]).size} bytes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopy(currentSvg)}
            style={{ borderRadius: 6 }}
          >
            Copy SVG
          </Button>
          <Button
            size="small"
            icon={<UploadOutlined />}
            onClick={() => fileInputRef.current?.click()}
            style={{ borderRadius: 6 }}
          >
            Upload
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<DownloadOutlined />}
            onClick={handleDownloadSvg}
            style={{
              background: "hsl(var(--primary))",
              borderColor: "hsl(var(--primary))",
              borderRadius: 6,
              fontWeight: 500,
            }}
          >
            Download SVG
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultActiveKey="preview"
        items={tabItems}
        className="flex-1 flex flex-col overflow-hidden [&_.ant-tabs-content]:flex-1 [&_.ant-tabs-content]:flex [&_.ant-tabs-content]:flex-col [&_.ant-tabs-content]:overflow-hidden [&_.ant-tabs-content-holder]:flex-1 [&_.ant-tabs-content-holder]:flex [&_.ant-tabs-content-holder]:flex-col [&_.ant-tabs-content-holder]:overflow-hidden [&_.ant-tabs-tabpane]:flex-1 [&_.ant-tabs-tabpane]:flex [&_.ant-tabs-tabpane]:flex-col [&_.ant-tabs-tabpane]:overflow-hidden"
        tabBarStyle={{ paddingLeft: 20, marginBottom: 0, borderBottom: "1px solid hsl(var(--border))" }}
      />

      {/* Bottom toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-t"
        style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--toolbar-bg))" }}
      >
        <div className="flex items-center gap-3">
          <Tooltip title="Zoom out">
            <Button size="small" type="text" icon={<ZoomOutOutlined />} onClick={() => setZoom((z) => Math.max(z - 25, 25))} />
          </Tooltip>
          <div className="w-24">
            <Slider
              min={25}
              max={400}
              step={25}
              value={zoom}
              onChange={setZoom}
              tooltip={{ formatter: (v) => `${v}%` }}
              styles={{ track: { background: "hsl(var(--primary))" }, rail: { background: "hsl(var(--border))" } }}
            />
          </div>
          <Tooltip title="Zoom in">
            <Button size="small" type="text" icon={<ZoomInOutlined />} onClick={() => setZoom((z) => Math.min(z + 25, 400))} />
          </Tooltip>
          <span className="text-xs font-mono font-medium min-w-[36px]" style={{ color: "hsl(var(--muted-foreground))" }}>
            {zoom}%
          </span>

          <div className="h-4 w-px mx-1" style={{ background: "hsl(var(--border))" }} />

          <div className="flex items-center gap-1">
            {bgButtons.map((bg) => (
              <Tooltip key={bg.type} title={bg.label}>
                <button
                  onClick={() => setBgType(bg.type)}
                  className="w-5 h-5 rounded-full transition-all"
                  style={{
                    ...bg.style,
                    outline: bgType === bg.type ? "2px solid hsl(var(--primary))" : "1px solid hsl(var(--border))",
                    outlineOffset: bgType === bg.type ? 2 : 0,
                  }}
                />
              </Tooltip>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip title="Fit to screen">
            <Button size="small" type="text" icon={<ExpandOutlined />} onClick={() => setZoom(100)} />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default SvgPreviewPanel;
