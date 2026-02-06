import { useState, useRef } from "react";
import { Tabs, Button, Tooltip, message } from "antd";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  DownloadOutlined,
  CopyOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { SvgItem } from "@/data/sampleSvgs";

interface SvgPreviewPanelProps {
  selectedSvg: SvgItem | null;
  onUpload: (svg: string, name: string) => void;
}

type BgType = "primary" | "white" | "dark" | "checker";

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

  return `const SvgIcon = () => (\n  ${code}\n);\n\nexport default SvgIcon;`;
};

const svgToReactNative = (svg: string): string => {
  return `import Svg, { Path, Circle, Rect } from 'react-native-svg';\n\nconst SvgIcon = (props) => (\n  ${svg.replace("<svg", "<Svg").replace("</svg>", "</Svg>").replace(/<path/g, "<Path").replace(/<\/path>/g, "").replace(/<circle/g, "<Circle").replace(/<rect/g, "<Rect")}\n);\n\nexport default SvgIcon;`;
};

const svgToDataUri = (svg: string): string => {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `data:image/svg+xml,${encoded}`;
};

const SvgPreviewPanel = ({ selectedSvg, onUpload }: SvgPreviewPanelProps) => {
  const [zoom, setZoom] = useState(100);
  const [bgType, setBgType] = useState<BgType>("primary");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 400));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 25));

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success("Copied to clipboard!");
  };

  const handleDownloadSvg = () => {
    if (!selectedSvg) return;
    const blob = new Blob([selectedSvg.svg], { type: "image/svg+xml" });
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
    const svgBlob = new Blob([selectedSvg.svg], { type: "image/svg+xml" });
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

  const getBgStyle = (): string => {
    switch (bgType) {
      case "primary": return "bg-orange-50";
      case "white": return "bg-white";
      case "dark": return "bg-gray-900";
      case "checker": return "checker-bg bg-white";
      default: return "bg-white";
    }
  };

  const bgButtons: { type: BgType; color: string; border?: string }[] = [
    { type: "primary", color: "hsl(var(--primary))" },
    { type: "white", color: "#ffffff", border: "1px solid hsl(var(--border))" },
    { type: "dark", color: "#1a1a2e" },
    { type: "checker", color: "transparent" },
  ];

  if (!selectedSvg) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ background: "hsl(var(--secondary))" }}>
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
          >
            <UploadOutlined style={{ fontSize: 28 }} />
          </div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: "hsl(var(--foreground))" }}>
            SVG Viewer
          </h2>
          <p className="text-sm mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>
            Select an SVG from the sidebar or upload your own
          </p>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => fileInputRef.current?.click()}
            style={{ background: "hsl(var(--primary))", borderColor: "hsl(var(--primary))" }}
          >
            Upload SVG
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>
    );
  }

  const tabItems = [
    {
      key: "preview",
      label: "Preview",
      children: (
        <div className="flex-1 flex flex-col">
          <div className={`flex-1 flex items-center justify-center p-8 min-h-[400px] ${getBgStyle()}`}>
            <div
              style={{ width: `${zoom * 3}px`, height: `${zoom * 3}px`, transition: "all 0.2s ease" }}
              dangerouslySetInnerHTML={{ __html: selectedSvg.svg }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "react",
      label: "React",
      children: (
        <div className="flex-1 flex flex-col">
          <div className="flex justify-end p-2 border-b" style={{ borderColor: "hsl(var(--border))" }}>
            <Tooltip title="Copy code">
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => handleCopy(svgToReact(selectedSvg.svg))}
              />
            </Tooltip>
          </div>
          <pre className="svg-code-block flex-1 overflow-auto p-4 m-0" style={{ background: "hsl(var(--secondary))" }}>
            <code>{svgToReact(selectedSvg.svg)}</code>
          </pre>
        </div>
      ),
    },
    {
      key: "react-native",
      label: "React Native",
      children: (
        <div className="flex-1 flex flex-col">
          <div className="flex justify-end p-2 border-b" style={{ borderColor: "hsl(var(--border))" }}>
            <Tooltip title="Copy code">
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => handleCopy(svgToReactNative(selectedSvg.svg))}
              />
            </Tooltip>
          </div>
          <pre className="svg-code-block flex-1 overflow-auto p-4 m-0" style={{ background: "hsl(var(--secondary))" }}>
            <code>{svgToReactNative(selectedSvg.svg)}</code>
          </pre>
        </div>
      ),
    },
    {
      key: "png",
      label: "PNG",
      children: (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
          <div
            className="w-48 h-48 flex items-center justify-center rounded-lg border"
            style={{ borderColor: "hsl(var(--border))" }}
            dangerouslySetInnerHTML={{ __html: selectedSvg.svg }}
          />
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadPng}
            style={{ background: "hsl(var(--primary))", borderColor: "hsl(var(--primary))" }}
          >
            Download PNG
          </Button>
        </div>
      ),
    },
    {
      key: "data-uri",
      label: "Data URI",
      children: (
        <div className="flex-1 flex flex-col">
          <div className="flex justify-end p-2 border-b" style={{ borderColor: "hsl(var(--border))" }}>
            <Tooltip title="Copy Data URI">
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => handleCopy(svgToDataUri(selectedSvg.svg))}
              />
            </Tooltip>
          </div>
          <pre className="svg-code-block flex-1 overflow-auto p-4 m-0 break-all whitespace-pre-wrap" style={{ background: "hsl(var(--secondary))" }}>
            <code>{svgToDataUri(selectedSvg.svg)}</code>
          </pre>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg"
        className="hidden"
        onChange={handleFileUpload}
      />

      <Tabs
        defaultActiveKey="preview"
        items={tabItems}
        className="flex-1 flex flex-col [&_.ant-tabs-content]:flex-1 [&_.ant-tabs-content]:flex [&_.ant-tabs-content]:flex-col [&_.ant-tabs-tabpane]:flex-1 [&_.ant-tabs-tabpane]:flex [&_.ant-tabs-tabpane]:flex-col"
        tabBarExtraContent={
          <Button
            size="small"
            icon={<UploadOutlined />}
            onClick={() => fileInputRef.current?.click()}
            style={{ marginRight: 12 }}
          >
            Upload
          </Button>
        }
        tabBarStyle={{ paddingLeft: 16, marginBottom: 0 }}
      />

      {/* Bottom toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-t"
        style={{
          borderColor: "hsl(var(--toolbar-border))",
          background: "hsl(var(--toolbar-bg))",
        }}
      >
        <div className="flex items-center gap-2">
          <Tooltip title="Zoom out">
            <Button size="small" icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
          </Tooltip>
          <span className="text-xs font-medium min-w-[40px] text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
            {zoom}%
          </span>
          <Tooltip title="Zoom in">
            <Button size="small" icon={<ZoomInOutlined />} onClick={handleZoomIn} />
          </Tooltip>

          <div className="flex items-center gap-1.5 ml-4">
            {bgButtons.map((bg) => (
              <button
                key={bg.type}
                onClick={() => setBgType(bg.type)}
                className="w-5 h-5 rounded transition-all"
                style={{
                  background: bg.type === "checker"
                    ? "repeating-conic-gradient(#e0e0e0 0% 25%, white 0% 50%) 50% / 10px 10px"
                    : bg.color,
                  border: bgType === bg.type ? "2px solid hsl(var(--primary))" : bg.border || "1px solid hsl(var(--border))",
                  outline: bgType === bg.type ? "2px solid hsl(var(--primary) / 0.3)" : "none",
                  outlineOffset: 1,
                }}
              />
            ))}
          </div>
        </div>

        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownloadSvg}
          size="small"
          style={{ background: "hsl(var(--primary))", borderColor: "hsl(var(--primary))" }}
        >
          Download
        </Button>
      </div>
    </div>
  );
};

export default SvgPreviewPanel;
