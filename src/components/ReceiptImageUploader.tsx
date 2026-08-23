import React, { useState, useRef } from "react";
import { 
  Camera, 
  Upload, 
  X, 
  Eye, 
  Check, 
  Link as LinkIcon, 
  AlertCircle, 
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Image as ImageIcon
} from "lucide-react";
import { 
  uploadReceiptToCloud, 
  normalizeReceiptUrl, 
  compressImage,
  UploadResult 
} from "../utils/imageUploader";

interface ReceiptImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export const ReceiptImageUploader: React.FC<ReceiptImageUploaderProps> = ({
  value = "",
  onChange,
  label = "Official Receipt Photo / Proof"
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "url" | "presets">("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStats, setUploadStats] = useState<{ original: string; compressed: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawUrlInput, setRawUrlInput] = useState(value);
  
  // Safe Lightbox viewer state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Hidden file input refs
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // High-reliability sample receipts for testing
  const presetReceipts = [
    {
      name: "Bookstore / School Supplies",
      url: "https://images.unsplash.com/photo-1583521214690-73421a1829a9?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Printing / Photocopying",
      url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Classroom Event / Snacks",
      url: "https://images.unsplash.com/photo-1554415707-9e49016a30c5?auto=format&fit=crop&w=800&q=80"
    }
  ];

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid photo or image file (JPEG, PNG, WebP, HEIC).");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError("Image file is too large. Please select a photo smaller than 25MB.");
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(10);

    try {
      const result: UploadResult = await uploadReceiptToCloud(file, (percent) => {
        setUploadProgress(percent);
      });

      onChange(result.url);
      setRawUrlInput(result.url);
      setUploadStats({
        original: formatFileSize(result.originalSize),
        compressed: formatFileSize(result.compressedSize)
      });
    } catch (err: any) {
      console.error("Receipt upload failure:", err);
      // Fallback: Use client-side compressed base64 directly
      try {
        const fallback = await compressImage(file, 1280, 0.75);
        onChange(fallback.dataUrl);
        setRawUrlInput(fallback.dataUrl);
        setUploadStats({
          original: formatFileSize(file.size),
          compressed: formatFileSize(fallback.blob.size)
        });
      } catch (fallbackErr) {
        setError("Could not process image. Please try another photo or paste a direct image URL.");
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUrlSubmit = (inputUrl: string) => {
    setRawUrlInput(inputUrl);
    const normalized = normalizeReceiptUrl(inputUrl);
    onChange(normalized);
    setUploadStats(null);
    if (normalized) {
      setError(null);
    }
  };

  const handleClear = () => {
    onChange("");
    setRawUrlInput("");
    setUploadStats(null);
    setError(null);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleOpenExternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!value) return;

    if (value.startsWith("data:")) {
      try {
        const imageWindow = window.open("", "_blank");
        if (imageWindow) {
          imageWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Receipt Preview - ClassFund Manager</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body {
                    margin: 0;
                    padding: 24px;
                    background: #090d16;
                    color: #fff;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    font-family: system-ui, -apple-system, sans-serif;
                    box-sizing: border-box;
                  }
                  img {
                    max-width: 95vw;
                    max-height: 85vh;
                    object-fit: contain;
                    border-radius: 12px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                    background: #fff;
                  }
                </style>
              </head>
              <body>
                <img src="${value}" alt="Receipt Preview" />
              </body>
            </html>
          `);
          imageWindow.document.close();
          return;
        }
      } catch (err) {
        console.warn("Could not open data URL:", err);
      }
    }

    window.open(value, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-2 text-left">
      {/* Hidden native input for Gallery picking */}
      <input
        type="file"
        ref={galleryInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/heic,image/*"
        className="hidden"
      />

      {/* Hidden native input for Direct Camera capture */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Header with Title & Zero-Storage Badge */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> 0 MB Web Storage
        </span>
      </div>

      {/* Method Selector Tabs */}
      <div className="flex items-center justify-between bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
              activeTab === "upload" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Upload className="h-3 w-3" /> Photo Upload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
              activeTab === "url" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <LinkIcon className="h-3 w-3" /> Paste URL
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
              activeTab === "presets" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Presets
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      {activeTab === "upload" && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-4 transition relative overflow-hidden ${
            isDragging
              ? "border-emerald-500 bg-emerald-50/50 scale-[1.01]"
              : isUploading
              ? "border-emerald-400 bg-emerald-50/30"
              : value
              ? "border-slate-200 bg-slate-50/50"
              : "border-slate-300 hover:border-emerald-400 bg-slate-50/30"
          }`}
        >
          {isUploading ? (
            <div className="py-4 space-y-2 text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-xs">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Compressing & converting receipt into direct URL link...</span>
              </div>
              <div className="w-48 mx-auto bg-emerald-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">Zero web hosting disk space used</p>
            </div>
          ) : (
            <div className="py-2 space-y-3 text-center">
              <div className="flex justify-center items-center gap-2.5">
                {/* Photo Gallery Button */}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="px-4 py-2 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-bold text-slate-800 hover:text-emerald-800 transition flex items-center gap-2 shadow-2xs cursor-pointer"
                >
                  <ImageIcon className="h-4 w-4 text-emerald-600" />
                  <span>Choose from Gallery</span>
                </button>

                {/* Direct Camera Button */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs font-bold text-white transition flex items-center gap-2 shadow-2xs cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                  <span>Take Photo</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 font-medium">
                Or drag and drop receipt image anywhere in this box
              </div>
            </div>
          )}
        </div>
      )}

      {/* Paste URL Tab */}
      {activeTab === "url" && (
        <div className="space-y-2">
          <div className="relative">
            <LinkIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="url"
              placeholder="Paste Google Drive, Imgur, Cloudinary, or direct image link..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
              value={rawUrlInput}
              onChange={(e) => handleUrlSubmit(e.target.value)}
            />
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <Check className="h-3 w-3 text-emerald-600" /> Google Drive share links are automatically transformed into direct image previews.
          </p>
        </div>
      )}

      {/* Presets Tab */}
      {activeTab === "presets" && (
        <div className="grid grid-cols-3 gap-2">
          {presetReceipts.map((preset) => (
            <button
              type="button"
              key={preset.name}
              onClick={() => {
                onChange(preset.url);
                setRawUrlInput(preset.url);
                setUploadStats(null);
              }}
              className={`py-2 px-2.5 rounded-xl text-[11px] font-bold border transition text-center truncate cursor-pointer ${
                value === preset.url
                  ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Active Attachment Link & Preview Card */}
      {value && (
        <div className="bg-slate-50/90 border border-slate-200 p-3 rounded-2xl flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3 min-w-0">
            {/* Thumbnail */}
            <div 
              onClick={() => setPreviewOpen(true)}
              className="h-12 w-12 rounded-xl bg-slate-200 overflow-hidden border border-slate-300/80 shrink-0 relative cursor-pointer group"
              title="Click to expand receipt"
            >
              <img 
                src={value} 
                alt="Receipt proof thumbnail" 
                className="h-full w-full object-cover group-hover:scale-105 transition"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                <Eye className="h-4 w-4" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900">Receipt Attached</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate max-w-[180px] sm:max-w-xs">
                {value}
              </div>
              {uploadStats && (
                <div className="text-[9px] text-emerald-700 font-semibold mt-0.5">
                  Compressed: {uploadStats.original} &rarr; {uploadStats.compressed} (0 MB web storage)
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              title="Inspect Receipt Full Screen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleOpenExternal}
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              title="Open in new window"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-red-500 hover:text-red-700 bg-white border border-red-100 rounded-lg hover:bg-red-50 transition cursor-pointer"
              title="Remove Receipt Attachment"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Interactive Modal Zoom & Inspection Preview (Safe Lightbox) */}
      {previewOpen && value && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col justify-between p-4"
          onClick={() => setPreviewOpen(false)}
        >
          {/* Modal Header Toolbar */}
          <div 
            className="flex items-center justify-between bg-slate-900 text-white px-4 py-3 rounded-2xl border border-slate-800 max-w-3xl mx-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-emerald-400" />
              <span className="font-bold text-sm">Receipt Attachment Inspector</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
                className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRotation(prev => (prev + 90) % 360)}
                className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs transition cursor-pointer"
                title="Rotate 90°"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleOpenExternal}
                className="p-1.5 text-emerald-400 hover:text-emerald-300 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs transition cursor-pointer"
                title="Open in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
              <button 
                type="button"
                onClick={() => {
                  setZoomLevel(1);
                  setRotation(0);
                  setPreviewOpen(false);
                }}
                className="text-white bg-red-600/80 hover:bg-red-600 p-1.5 rounded-lg cursor-pointer ml-1"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Modal Image Body */}
          <div 
            className="flex-1 flex items-center justify-center p-2 overflow-auto max-h-[calc(100vh-140px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={value} 
              alt="Receipt Inspection Full" 
              className="max-w-[90vw] max-h-[80vh] object-contain rounded-xl shadow-2xl transition-transform duration-150 bg-white"
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`
              }}
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Modal Footer */}
          <div className="text-center text-slate-400 text-xs py-1">
            Click outside or tap &times; to exit preview
          </div>
        </div>
      )}
    </div>
  );
};
