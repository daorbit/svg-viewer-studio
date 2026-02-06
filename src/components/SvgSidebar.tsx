import { useState, useMemo } from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { SvgItem } from "@/data/sampleSvgs";

interface SvgSidebarProps {
  svgs: SvgItem[];
  selectedId: string | null;
  onSelect: (svg: SvgItem) => void;
  onUpload: (svg: string, name: string) => void;
}

const SvgSidebar = ({ svgs, selectedId, onSelect, onUpload }: SvgSidebarProps) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      svgs.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      ),
    [svgs, search]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        onUpload(content, file.name.replace(".svg", ""));
      };
      reader.readAsText(file);
    }
  };

  return (
    <div
      className="w-[220px] min-w-[220px] h-screen border-r flex flex-col"
      style={{ borderColor: "hsl(var(--sidebar-border))", background: "hsl(var(--sidebar-bg))" }}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Logo */}
      <div className="px-4 py-3 border-b" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
          >
            S
          </div>
          <span className="font-semibold text-sm" style={{ color: "hsl(var(--foreground))" }}>
            <span style={{ color: "hsl(var(--primary))" }}>SVG</span>Viewer
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <Input
          placeholder="Search SVGs"
          prefix={<SearchOutlined style={{ color: "hsl(var(--muted-foreground))" }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="small"
          style={{ borderRadius: 6 }}
        />
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 svg-sidebar-grid">
        <div className="grid grid-cols-3 gap-2">
          {filtered.map((svg) => (
            <div
              key={svg.id}
              onClick={() => onSelect(svg)}
              className="w-full aspect-square rounded-lg flex items-center justify-center cursor-pointer transition-all duration-150 border"
              style={{
                borderColor:
                  selectedId === svg.id
                    ? "hsl(var(--primary))"
                    : "transparent",
                background:
                  selectedId === svg.id
                    ? "hsl(var(--sidebar-item-active))"
                    : "transparent",
              }}
              onMouseEnter={(e) => {
                if (selectedId !== svg.id) {
                  e.currentTarget.style.background = "hsl(var(--sidebar-item-hover))";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedId !== svg.id) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
              title={svg.name}
            >
              <div
                className="w-7 h-7"
                dangerouslySetInnerHTML={{ __html: svg.svg }}
              />
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            No SVGs found
          </div>
        )}
      </div>
    </div>
  );
};

export default SvgSidebar;
