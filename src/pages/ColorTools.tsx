import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Palette, Copy, Check, RefreshCw } from 'lucide-react';

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
};

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

const ColorTools = () => {
  const [hex, setHex] = useState('#f97316');
  const [copied, setCopied] = useState('');
  const { toast } = useToast();

  const rgb = hexToRgb(hex);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;

  const formats = rgb && hsl ? [
    { label: 'HEX', value: hex.toUpperCase() },
    { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: 'RGBA', value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` },
  ] : [];

  // Generate shades
  const shades = rgb && hsl ? Array.from({ length: 9 }, (_, i) => {
    const l = Math.round((i + 1) * 10);
    return `hsl(${hsl.h}, ${hsl.s}%, ${l}%)`;
  }) : [];

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
    toast({ title: 'Copied!' });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Palette className="w-5 h-5" />
          </div>
          Color Tools
        </h1>
        <p className="text-muted-foreground">Pick colors and convert between HEX, RGB, and HSL</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Picker */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Color Picker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                className="w-16 h-16 rounded-lg cursor-pointer border border-border"
              />
              <div className="flex-1 space-y-2">
                <Input
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  placeholder="#f97316"
                  className="font-mono"
                />
                <Button variant="outline" size="sm" className="w-full" onClick={() => setHex(randomColor())}>
                  <RefreshCw className="w-3 h-3 mr-1" /> Random
                </Button>
              </div>
            </div>

            <div
              className="w-full h-32 rounded-xl border border-border transition-colors duration-300"
              style={{ backgroundColor: hex }}
            />
          </CardContent>
        </Card>

        {/* Formats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Color Formats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {formats.map((f) => (
              <div key={f.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <div>
                  <span className="text-xs text-muted-foreground">{f.label}</span>
                  <p className="font-mono text-sm text-foreground">{f.value}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => copy(f.value)}>
                  {copied === f.value ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Shades */}
      {shades.length > 0 && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Shades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1 h-16 rounded-lg overflow-hidden">
              {shades.map((shade, i) => (
                <button
                  key={i}
                  className="flex-1 transition-transform hover:scale-y-110 cursor-pointer"
                  style={{ backgroundColor: shade }}
                  onClick={() => copy(shade)}
                  title={shade}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ColorTools;
