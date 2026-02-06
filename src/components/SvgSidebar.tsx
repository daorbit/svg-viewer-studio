import { useState, useMemo, useRef } from "react";
import { Input, Tooltip } from "antd";
import { SearchOutlined, PlusOutlined, CloudUploadOutlined } from "@ant-design/icons";
import { SvgItem } from "@/data/sampleSvgs";

interface SvgSidebarProps {
  svgs: SvgItem[];
  selectedId: string | null;
  onSelect: (svg: SvgItem) => void;
  onUpload: (svg: string, name: string) => void;
}

const SvgSidebar = ({ svgs, selectedId, onSelect, onUpload }: SvgSidebarProps) => {
  const [search, setSearch] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () => svgs.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())),
    [svgs, search]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
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

  return (
    <div
      className="w-[260px] min-w-[260px] h-screen flex flex-col"
      style={{ background: "#fafafa", borderRight: "1px solid hsl(var(--border))" }}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
    >
      <input ref={fileInputRef} type="file" accept=".svg" className="hidden" onChange={handleFileUpload} />

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
              <line x1="12" y1="22" x2="12" y2="15.5" />
              <polyline points="22 8.5 12 15.5 2 8.5" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-[15px] tracking-tight" style={{ color: "hsl(var(--foreground))" }}>
              SVG<span style={{ color: "hsl(var(--primary))" }}>Viewer</span>
            </span>
            <p className="text-[10px] leading-none mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
              View · Edit · Convert
            </p>
          </div>
        </div>
        <Tooltip title="Upload SVG">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
            style={{ color: "hsl(var(--muted-foreground))" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "hsl(var(--sidebar-item-hover))";
              e.currentTarget.style.color = "hsl(var(--primary))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "hsl(var(--muted-foreground))";
            }}
          >
            <PlusOutlined style={{ fontSize: 14 }} />
          </button>
        </Tooltip>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <Input
          placeholder="Search icons..."
          prefix={<SearchOutlined style={{ color: "hsl(var(--muted-foreground))", fontSize: 13 }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="small"
          style={{ borderRadius: 8, background: "white", fontSize: 13 }}
        />
      </div>

      {/* Icons count */}
      <div className="px-5 pb-2">
        <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>
          Icons ({filtered.length})
        </span>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 svg-sidebar-grid">
        {isDragOver ? (
          <div
            className="flex flex-col items-center justify-center gap-2 h-40 rounded-xl border-2 border-dashed transition-all"
            style={{ borderColor: "hsl(var(--primary))", background: "hsl(var(--sidebar-item-active))" }}
          >
            <CloudUploadOutlined style={{ fontSize: 28, color: "hsl(var(--primary))" }} />
            <span className="text-xs font-medium" style={{ color: "hsl(var(--primary))" }}>Drop SVG here</span>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1.5">
            {filtered.map((svg) => {
              const isSelected = selectedId === svg.id;
              return (
                <Tooltip key={svg.id} title={svg.name} mouseEnterDelay={0.4}>
                  <div
                    onClick={() => onSelect(svg)}
                    className="aspect-square rounded-lg flex items-center justify-center cursor-pointer transition-all duration-150 group relative"
                    style={{
                      border: isSelected ? "2px solid hsl(var(--primary))" : "1px solid transparent",
                      background: isSelected ? "hsl(var(--sidebar-item-active))" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "white";
                        e.currentTarget.style.border = "1px solid hsl(var(--border))";
                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.border = "1px solid transparent";
                        e.currentTarget.style.boxShadow = "none";
                      }
                    }}
                  >
                    <div className="w-6 h-6" dangerouslySetInnerHTML={{ __html: svg.svg }} />
                  </div>
                </Tooltip>
              );
            })}
          </div>
        )}
        {!isDragOver && filtered.length === 0 && (
          <div className="text-center py-12">
            <SearchOutlined style={{ fontSize: 24, color: "hsl(var(--muted-foreground))", opacity: 0.4 }} />
            <p className="text-xs mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>No SVGs found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SvgSidebar;
