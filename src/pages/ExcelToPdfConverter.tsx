import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, Download } from "lucide-react";
import { apiService } from "@/services/api";

const ExcelToPdfConverter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (
      selectedFile &&
      (selectedFile.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.name.endsWith(".xlsx"))
    ) {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a .xlsx file",
        variant: "destructive",
      });
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsConverting(true);

    try {
      const blob = await apiService.convertExcelToPdf(file);
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);

      toast({
        title: "Conversion successful",
        description: "Your PDF is ready to view and download",
      });
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;

    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = "converted.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleNewConversion = () => {
    setFile(null);
    setPdfUrl(null);
    // Reset file input
    const fileInput = document.getElementById(
      "file-upload",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="h-[100vh]  mx-auto p-6">
      <div className=" mx-auto h-full">
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 h-full">
          {/* Left side - File Upload */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="file-upload" className="text-sm font-medium">
                Select Excel Document (.xlsx)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name}
                </p>
              )}
            </div>

            <Button
              onClick={handleConvert}
              disabled={!file || isConverting}
              className="w-full"
            >
              {isConverting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Converting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Convert to PDF
                </>
              )}
            </Button>

            {pdfUrl && (
              <div className="flex gap-2">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={handleNewConversion} variant="outline">
                  New File
                </Button>
              </div>
            )}
          </div>

          {/* Right side - PDF Viewer */}
          <div className="space-y-4 h-full">
            {pdfUrl ? (
              <div className="border rounded-lg overflow-hidden h-full">
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  title="PDF Preview"
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">PDF Preview</p>
                  <p className="text-sm">
                    Convert an Excel file to see the PDF here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelToPdfConverter;
