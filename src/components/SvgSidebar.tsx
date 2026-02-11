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
      className="w-[260px] min-w-[260px] h-screen flex flex-col bg-card border-r border-border"
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
    >
      <input ref={fileInputRef} type="file" accept=".svg" className="hidden" onChange={handleFileUpload} />

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold bg-primary text-primary-foreground">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
              <line x1="12" y1="22" x2="12" y2="15.5" />
              <polyline points="22 8.5 12 15.5 2 8.5" />
            </svg>
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground">
            SVG<span className="text-primary">Viewer</span>
          </span>
        </div>
        <Tooltip title="Upload SVG">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-6 h-6 rounded flex items-center justify-center transition-colors text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <PlusOutlined style={{ fontSize: 13 }} />
          </button>
        </Tooltip>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <Input
          placeholder="Search icons..."
          prefix={<SearchOutlined style={{ color: "hsl(var(--muted-foreground))", fontSize: 12 }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="small"
          style={{ borderRadius: 4, fontSize: 12 }}
        />
      </div>

      {/* Section label */}
      <div className="px-4 py-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Explorer — {filtered.length} icons
        </span>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {isDragOver ? (
          <div className="flex flex-col items-center justify-center gap-2 h-40 rounded-lg border-2 border-dashed border-primary bg-primary/5">
            <CloudUploadOutlined style={{ fontSize: 24, color: "hsl(var(--primary))" }} />
            <span className="text-xs font-medium text-primary">Drop SVG here</span>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1">
            {filtered.map((svg) => {
              const isSelected = selectedId === svg.id;
              return (
                <Tooltip key={svg.id} title={svg.name} mouseEnterDelay={0.4}>
                  <div
                    onClick={() => onSelect(svg)}
                    className={`aspect-square rounded flex items-center justify-center cursor-pointer transition-all duration-100 border ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-transparent hover:bg-accent"
                    }`}
                  >
                    <div className="w-5 h-5 [&_svg]:fill-current text-muted-foreground" dangerouslySetInnerHTML={{ __html: svg.svg }} />
                  </div>
                </Tooltip>
              );
            })}
          </div>
        )}
        {!isDragOver && filtered.length === 0 && (
          <div className="text-center py-12">
            <SearchOutlined style={{ fontSize: 20, color: "hsl(var(--muted-foreground))", opacity: 0.4 }} />
            <p className="text-xs mt-2 text-muted-foreground">No icons found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SvgSidebar;