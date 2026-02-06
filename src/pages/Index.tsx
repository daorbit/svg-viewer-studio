import { useState, useCallback } from "react";
import { ConfigProvider } from "antd";
import SvgSidebar from "@/components/SvgSidebar";
import SvgPreviewPanel from "@/components/SvgPreviewPanel";
import { sampleSvgs, SvgItem } from "@/data/sampleSvgs";

const Index = () => {
  const [svgs, setSvgs] = useState<SvgItem[]>(sampleSvgs);
  const [selectedSvg, setSelectedSvg] = useState<SvgItem | null>(sampleSvgs[0]);

  const handleUpload = useCallback((svg: string, name: string) => {
    const newItem: SvgItem = {
      id: `upload-${Date.now()}`,
      name: name || "Uploaded SVG",
      svg,
    };
    setSvgs((prev) => [newItem, ...prev]);
    setSelectedSvg(newItem);
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#e87422",
          borderRadius: 6,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
      }}
    >
      <div className="flex h-screen overflow-hidden" style={{ background: "hsl(var(--background))" }}>
        <SvgSidebar
          svgs={svgs}
          selectedId={selectedSvg?.id ?? null}
          onSelect={setSelectedSvg}
          onUpload={handleUpload}
        />
        <SvgPreviewPanel
          selectedSvg={selectedSvg}
          onUpload={handleUpload}
        />
      </div>
    </ConfigProvider>
  );
};

export default Index;
