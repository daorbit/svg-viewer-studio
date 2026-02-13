import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, Image as ImageIcon, Settings, Zap, Copy, Check } from 'lucide-react';

interface ProcessedImage {
  name: string;
  originalSize: number;
  newSize: number;
  format: string;
  url: string;
  base64?: string;
}

const ImageTools: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Resizer options
  const [width, setWidth] = useState<string>('800');
  const [height, setHeight] = useState<string>('600');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [quality, setQuality] = useState<string>('0.8');

  // Converter options
  const [targetFormat, setTargetFormat] = useState<string>('webp');
  const [converterQuality, setConverterQuality] = useState<string>('0.8');

  // Base64 options
  const [base64Input, setBase64Input] = useState<string>('');
  const [base64Output, setBase64Output] = useState<string>('');
  const [decodedImageUrl, setDecodedImageUrl] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file.',
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setProcessedImages([]);
    }
  };

  const resizeImage = async (file: File, newWidth: number, newHeight: number, quality: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob((blob) => {
          resolve(blob!);
        }, file.type, quality);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const convertFormat = async (file: File, format: string, quality: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const mimeType = `image/${format}`;
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, mimeType, quality);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleResize = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const newWidth = parseInt(width);
      const newHeight = parseInt(height);
      const qualityValue = parseFloat(quality);

      setProgress(50);

      const resizedBlob = await resizeImage(selectedFile, newWidth, newHeight, qualityValue);
      const url = URL.createObjectURL(resizedBlob);

      const processedImage: ProcessedImage = {
        name: `resized-${selectedFile.name}`,
        originalSize: selectedFile.size,
        newSize: resizedBlob.size,
        format: selectedFile.type.split('/')[1],
        url,
      };

      setProcessedImages([processedImage]);
      setProgress(100);

      toast({
        title: 'Image resized successfully!',
        description: `Size reduced from ${formatBytes(selectedFile.size)} to ${formatBytes(resizedBlob.size)}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resize image.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const qualityValue = parseFloat(converterQuality);

      setProgress(50);

      const convertedBlob = await convertFormat(selectedFile, targetFormat, qualityValue);
      const url = URL.createObjectURL(convertedBlob);

      const processedImage: ProcessedImage = {
        name: `${selectedFile.name.split('.')[0]}.${targetFormat}`,
        originalSize: selectedFile.size,
        newSize: convertedBlob.size,
        format: targetFormat,
        url,
      };

      setProcessedImages([processedImage]);
      setProgress(100);

      toast({
        title: 'Image converted successfully!',
        description: `Format changed to ${targetFormat.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to convert image.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const encodeToBase64 = async () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setBase64Output(base64);

      const processedImage: ProcessedImage = {
        name: selectedFile.name,
        originalSize: selectedFile.size,
        newSize: base64.length,
        format: 'base64',
        url: previewUrl,
        base64,
      };

      setProcessedImages([processedImage]);

      toast({
        title: 'Image encoded to Base64!',
        description: `Base64 string generated (${formatBytes(base64.length)})`,
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const decodeFromBase64 = () => {
    if (!base64Input.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a Base64 string.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setDecodedImageUrl(base64Input);
      setBase64Output('');

      toast({
        title: 'Base64 decoded!',
        description: 'Image preview generated from Base64 string.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid Base64 string.',
        variant: 'destructive',
      });
    }
  };

  const downloadImage = (image: ProcessedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied to clipboard!',
        description: 'Base64 string copied successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateAspectRatio = (originalWidth: number, originalHeight: number, newWidth: number): number => {
    return Math.round((newWidth / originalWidth) * originalHeight);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Image Tools</h1>
        <p className="text-muted-foreground">Resize, convert, and optimize your images</p>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Image
          </CardTitle>
          <CardDescription>
            Select an image file to get started with resizing, conversion, or Base64 encoding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Choose Image
            </Button>
            {selectedFile && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedFile.name}</Badge>
                <span className="text-sm text-muted-foreground">
                  {formatBytes(selectedFile.size)}
                </span>
              </div>
            )}
          </div>

          {previewUrl && (
            <div className="mt-4 flex justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-xs max-h-48 object-contain border rounded-lg"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {selectedFile && (
        <Tabs defaultValue="resize" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resize">Resize & Optimize</TabsTrigger>
            <TabsTrigger value="convert">Format Converter</TabsTrigger>
            <TabsTrigger value="base64">Base64 Tools</TabsTrigger>
          </TabsList>

          {/* Resize Tab */}
          <TabsContent value="resize">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Resize & Optimize
                </CardTitle>
                <CardDescription>
                  Change image dimensions and optimize file size.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (px)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={width}
                      onChange={(e) => {
                        setWidth(e.target.value);
                        if (maintainAspectRatio && selectedFile) {
                          const img = new Image();
                          img.onload = () => {
                            const newHeight = calculateAspectRatio(img.width, img.height, parseInt(e.target.value));
                            setHeight(newHeight.toString());
                          };
                          img.src = previewUrl;
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (px)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quality">Quality (0-1)</Label>
                  <Input
                    id="quality"
                    type="number"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                  />
                </div>

                <Button onClick={handleResize} disabled={isProcessing} className="w-full">
                  {isProcessing ? 'Processing...' : 'Resize Image'}
                </Button>

                {isProcessing && (
                  <Progress value={progress} className="w-full" />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Convert Tab */}
          <TabsContent value="convert">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Format Converter
                </CardTitle>
                <CardDescription>
                  Convert images between different formats.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="targetFormat">Target Format</Label>
                  <Select value={targetFormat} onValueChange={setTargetFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="webp">WebP</SelectItem>
                      <SelectItem value="jpeg">JPEG</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="converterQuality">Quality (0-1)</Label>
                  <Input
                    id="converterQuality"
                    type="number"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={converterQuality}
                    onChange={(e) => setConverterQuality(e.target.value)}
                  />
                </div>

                <Button onClick={handleConvert} disabled={isProcessing} className="w-full">
                  {isProcessing ? 'Converting...' : 'Convert Image'}
                </Button>

                {isProcessing && (
                  <Progress value={progress} className="w-full" />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Base64 Tab */}
          <TabsContent value="base64">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Encode to Base64
                  </CardTitle>
                  <CardDescription>
                    Convert your image to a Base64 data URL.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={encodeToBase64} className="w-full">
                    Encode Image
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Decode from Base64
                  </CardTitle>
                  <CardDescription>
                    Convert Base64 string back to an image.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="base64Input">Base64 String</Label>
                    <textarea
                      id="base64Input"
                      className="w-full h-24 p-2 border rounded-md resize-none"
                      value={base64Input}
                      onChange={(e) => setBase64Input(e.target.value)}
                      placeholder="Paste your Base64 string here..."
                    />
                  </div>
                  <Button onClick={decodeFromBase64} className="w-full">
                    Decode Image
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Results */}
      {processedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processed Images</CardTitle>
            <CardDescription>
              Your processed images are ready for download.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processedImages.map((image, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{image.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {image.format.toUpperCase()} • {formatBytes(image.newSize)}
                        {image.originalSize !== image.newSize && (
                          <span className="ml-2 text-green-600">
                            ({Math.round((1 - image.newSize / image.originalSize) * 100)}% smaller)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {image.base64 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(image.base64!)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadImage(image)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Base64 Output */}
      {base64Output && (
        <Card>
          <CardHeader>
            <CardTitle>Base64 Output</CardTitle>
            <CardDescription>
              Your image encoded as a Base64 data URL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <textarea
                className="w-full h-32 p-2 border rounded-md resize-none font-mono text-sm"
                value={base64Output}
                readOnly
              />
              <Button onClick={() => copyToClipboard(base64Output)} className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                Copy Base64 String
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decoded Image Preview */}
      {decodedImageUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Decoded Image</CardTitle>
            <CardDescription>
              Image decoded from Base64 string.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <img
                src={decodedImageUrl}
                alt="Decoded"
                className="max-w-xs max-h-48 object-contain border rounded-lg"
                onError={() => {
                  toast({
                    title: 'Error',
                    description: 'Failed to decode Base64 string.',
                    variant: 'destructive',
                  });
                  setDecodedImageUrl('');
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageTools;