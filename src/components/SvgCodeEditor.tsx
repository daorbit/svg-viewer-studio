import { useState, useEffect, useCallback } from "react";
import { Button, Tooltip, message } from "antd";
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
    if (valid) {
      onCodeChange(value);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    message.success("SVG code copied!");
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
      if (validateSvg(formatted)) {
        onCodeChange(formatted);
      }
    } catch {
      // ignore formatting errors
    }
  };

  const handleReset = () => {
    setCode(svgCode);
    setIsValid(true);
    onCodeChange(svgCode);
  };

  const lineCount = code.split("\n").length;

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b"
        style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--toolbar-bg))" }}
      >
        <div className="flex items-center gap-1">
          {!isValid && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "hsl(0 84% 60% / 0.1)", color: "hsl(0 84% 60%)" }}>
              Invalid SVG
            </span>
          )}
          {isValid && code !== svgCode && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "hsl(142 76% 36% / 0.1)", color: "hsl(142 76% 36%)" }}>
              Live preview active
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Tooltip title="Format code">
            <Button size="small" type="text" icon={<FormatPainterOutlined />} onClick={handleFormat} />
          </Tooltip>
          <Tooltip title="Reset to original">
            <Button size="small" type="text" icon={<UndoOutlined />} onClick={handleReset} />
          </Tooltip>
          <Tooltip title="Copy code">
            <Button size="small" type="text" icon={<CopyOutlined />} onClick={handleCopy} />
          </Tooltip>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex overflow-hidden" style={{ background: "#1e1e2e" }}>
        {/* Line numbers */}
        <div
          className="select-none py-3 px-2 text-right overflow-hidden"
          style={{
            fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace",
            fontSize: 13,
            lineHeight: "1.6",
            color: "#5c6370",
            minWidth: 40,
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={code}
          onChange={handleChange}
          spellCheck={false}
          className="flex-1 resize-none outline-none py-3 px-2"
          style={{
            fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace",
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
