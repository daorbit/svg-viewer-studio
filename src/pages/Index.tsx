import { useState, useCallback } from "react";
import { ConfigProvider, theme } from "antd";
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

  const handleSvgUpdate = useCallback((id: string, newSvg: string) => {
    setSvgs((prev) => prev.map((s) => (s.id === id ? { ...s, svg: newSvg } : s)));
    setSelectedSvg((prev) => (prev?.id === id ? { ...prev, svg: newSvg } : prev));
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#e87422",
          borderRadius: 4,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
      }}
    >
      <div className="flex h-screen overflow-hidden bg-background">
        <SvgSidebar
          svgs={svgs}
          selectedId={selectedSvg?.id ?? null}
          onSelect={setSelectedSvg}
          onUpload={handleUpload}
        />
        <SvgPreviewPanel
          selectedSvg={selectedSvg}
          onUpload={handleUpload}
          onSvgUpdate={handleSvgUpdate}
        />
      </div>
    </ConfigProvider>
  );
};

export default Index;