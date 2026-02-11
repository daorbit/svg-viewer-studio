import { useState, useEffect, useCallback } from "react";
import { Tooltip, message } from "antd";
import { CopyOutlined, FormatPainterOutlined, UndoOutlined } from "@ant-design/icons";

interface SvgCodeEditorProps {
  svgCode: string;
  onCodeChange: (code: string) => void;
}

const SvgCodeEditor = ({ svgCode, onCodeChange }: SvgCodeEditorProps) => {
  const [code, setCode] = useState(svgCode);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setCode(svgCode);
    setIsValid(true);
  }, [svgCode]);

  const validateSvg = useCallback((value: string): boolean => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(trimmed, "image/svg+xml");
      const errorNode = doc.querySelector("parsererror");
      return !errorNode && !!doc.querySelector("svg");
    } catch {
      return false;
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCode(value);
    const valid = validateSvg(value);
    setIsValid(valid);
    if (valid) onCodeChange(value);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    message.success("Copied!");
  };

  const handleFormat = () => {
    try {
      const formatted = code
        .replace(/></g, ">\n<")
        .replace(/(\s+)/g, " ")
        .replace(/> </g, ">\n<")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .join("\n");
      setCode(formatted);
      if (validateSvg(formatted)) onCodeChange(formatted);
    } catch { /* ignore */ }
  };

  const handleReset = () => {
    setCode(svgCode);
    setIsValid(true);
    onCodeChange(svgCode);
  };

  const lineCount = code.split("\n").length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Mini toolbar - dark */}
      <div className="flex items-center justify-between px-2 py-1" style={{ background: "hsl(228, 15%, 16%)", borderBottom: "1px solid hsl(228, 12%, 22%)" }}>
        <div className="flex items-center gap-1">
          {!isValid && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: "hsl(0 84% 60% / 0.15)", color: "hsl(0 72% 65%)" }}>
              Invalid SVG
            </span>
          )}
          {isValid && code !== svgCode && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: "hsl(142 76% 36% / 0.15)", color: "hsl(142 60% 55%)" }}>
              Modified
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <Tooltip title="Format">
            <button onClick={handleFormat} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
              <FormatPainterOutlined style={{ fontSize: 11, color: "#808080" }} />
            </button>
          </Tooltip>
          <Tooltip title="Reset">
            <button onClick={handleReset} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
              <UndoOutlined style={{ fontSize: 11, color: "#808080" }} />
            </button>
          </Tooltip>
          <Tooltip title="Copy">
            <button onClick={handleCopy} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
              <CopyOutlined style={{ fontSize: 11, color: "#808080" }} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Editor - dark */}
      <div className="flex-1 flex overflow-hidden" style={{ background: "hsl(var(--editor-bg))" }}>
        {/* Line numbers */}
        <div className="select-none py-3 px-2 text-right overflow-hidden"
          style={{ fontFamily: "'SF Mono', 'Fira Code', Menlo, Consolas, monospace", fontSize: 13, lineHeight: "1.6", color: "hsl(228, 9%, 35%)", minWidth: 40 }}>
          {Array.from({ length: lineCount }, (_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <textarea
          value={code}
          onChange={handleChange}
          spellCheck={false}
          className="flex-1 resize-none outline-none py-3 px-2"
          style={{
            fontFamily: "'SF Mono', 'Fira Code', Menlo, Consolas, monospace",
            fontSize: 13,
            lineHeight: "1.6",
            background: "transparent",
            color: "#abb2bf",
            caretColor: "hsl(var(--primary))",
            border: "none",
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
};

export default SvgCodeEditor;